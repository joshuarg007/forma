"""DNS Verification Service for Custom Domains"""
import dns.resolver
import asyncio
from typing import Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DNSVerificationService:
    """
    Verifies DNS records for custom domains.

    Supports:
    - CNAME verification (domain points to forma.app subdomain)
    - A record verification (domain points to our IP)
    - TXT record verification (for domain ownership)
    """

    # Forma's edge IPs (Cloudflare)
    FORMA_IPS = [
        "104.21.0.0",  # Cloudflare IP range - placeholder
        "172.67.0.0",  # Cloudflare IP range - placeholder
    ]

    def __init__(self, timeout: float = 5.0):
        self.timeout = timeout
        self.resolver = dns.resolver.Resolver()
        self.resolver.timeout = timeout
        self.resolver.lifetime = timeout

    async def verify_cname(self, domain: str, expected_target: str) -> Tuple[bool, Optional[str]]:
        """
        Verify a CNAME record points to the expected target.

        Args:
            domain: The domain to check (e.g., "www.example.com")
            expected_target: Expected CNAME target (e.g., "mysite.forma.app")

        Returns:
            Tuple of (success, actual_value or error_message)
        """
        try:
            # Run DNS query in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            answers = await loop.run_in_executor(
                None,
                lambda: self.resolver.resolve(domain, 'CNAME')
            )

            for rdata in answers:
                actual = str(rdata.target).rstrip('.')
                expected = expected_target.rstrip('.')

                if actual.lower() == expected.lower():
                    return True, actual

            # Found CNAME but wrong target
            actual_values = [str(r.target).rstrip('.') for r in answers]
            return False, f"CNAME points to {actual_values[0]}, expected {expected_target}"

        except dns.resolver.NXDOMAIN:
            return False, "Domain does not exist"
        except dns.resolver.NoAnswer:
            return False, "No CNAME record found"
        except dns.resolver.NoNameservers:
            return False, "No nameservers available"
        except dns.exception.Timeout:
            return False, "DNS query timed out"
        except Exception as e:
            logger.error(f"DNS verification error for {domain}: {e}")
            return False, str(e)

    async def verify_a_record(self, domain: str, expected_ips: list[str] = None) -> Tuple[bool, Optional[str]]:
        """
        Verify A record points to expected IP(s).

        Args:
            domain: The domain to check
            expected_ips: List of expected IP addresses (uses FORMA_IPS if not provided)

        Returns:
            Tuple of (success, actual_value or error_message)
        """
        expected_ips = expected_ips or self.FORMA_IPS

        try:
            loop = asyncio.get_event_loop()
            answers = await loop.run_in_executor(
                None,
                lambda: self.resolver.resolve(domain, 'A')
            )

            actual_ips = [str(rdata.address) for rdata in answers]

            # Check if any of the actual IPs match expected
            for ip in actual_ips:
                if ip in expected_ips:
                    return True, ip

            return False, f"A record points to {actual_ips[0]}, expected one of {expected_ips}"

        except dns.resolver.NXDOMAIN:
            return False, "Domain does not exist"
        except dns.resolver.NoAnswer:
            return False, "No A record found"
        except dns.exception.Timeout:
            return False, "DNS query timed out"
        except Exception as e:
            logger.error(f"DNS A record verification error for {domain}: {e}")
            return False, str(e)

    async def verify_txt_record(self, domain: str, expected_value: str) -> Tuple[bool, Optional[str]]:
        """
        Verify TXT record contains expected value.

        Args:
            domain: The domain to check (e.g., "_forma-verify.example.com")
            expected_value: Expected TXT value

        Returns:
            Tuple of (success, actual_value or error_message)
        """
        try:
            loop = asyncio.get_event_loop()
            answers = await loop.run_in_executor(
                None,
                lambda: self.resolver.resolve(domain, 'TXT')
            )

            for rdata in answers:
                # TXT records can have multiple strings
                txt_value = ''.join([s.decode() if isinstance(s, bytes) else s
                                     for s in rdata.strings])
                if expected_value in txt_value:
                    return True, txt_value

            actual_values = [''.join([s.decode() if isinstance(s, bytes) else s
                                      for s in r.strings]) for r in answers]
            return False, f"TXT record value mismatch. Found: {actual_values}"

        except dns.resolver.NXDOMAIN:
            return False, "Domain does not exist"
        except dns.resolver.NoAnswer:
            return False, "No TXT record found"
        except dns.exception.Timeout:
            return False, "DNS query timed out"
        except Exception as e:
            logger.error(f"DNS TXT verification error for {domain}: {e}")
            return False, str(e)

    async def verify_domain(
        self,
        domain: str,
        record_type: str,
        expected_value: str
    ) -> dict:
        """
        Unified domain verification.

        Args:
            domain: Domain to verify
            record_type: "CNAME", "A", or "TXT"
            expected_value: Expected record value

        Returns:
            Dict with verification results
        """
        start_time = datetime.utcnow()

        if record_type == "CNAME":
            success, message = await self.verify_cname(domain, expected_value)
        elif record_type == "A":
            success, message = await self.verify_a_record(domain, [expected_value])
        elif record_type == "TXT":
            success, message = await self.verify_txt_record(domain, expected_value)
        else:
            success, message = False, f"Unsupported record type: {record_type}"

        return {
            "verified": success,
            "domain": domain,
            "record_type": record_type,
            "expected_value": expected_value,
            "message": message,
            "checked_at": start_time.isoformat(),
        }

    async def check_domain_propagation(self, domain: str) -> dict:
        """
        Check if domain is properly propagated across DNS servers.

        Uses multiple public DNS servers to verify propagation.
        """
        dns_servers = [
            ("8.8.8.8", "Google"),
            ("1.1.1.1", "Cloudflare"),
            ("9.9.9.9", "Quad9"),
            ("208.67.222.222", "OpenDNS"),
        ]

        results = {}

        for server_ip, server_name in dns_servers:
            try:
                resolver = dns.resolver.Resolver()
                resolver.nameservers = [server_ip]
                resolver.timeout = self.timeout
                resolver.lifetime = self.timeout

                loop = asyncio.get_event_loop()
                answers = await loop.run_in_executor(
                    None,
                    lambda r=resolver: r.resolve(domain, 'A')
                )

                ips = [str(rdata.address) for rdata in answers]
                results[server_name] = {
                    "status": "resolved",
                    "ips": ips
                }
            except Exception as e:
                results[server_name] = {
                    "status": "failed",
                    "error": str(e)
                }

        # Check if all servers agree
        resolved_servers = [k for k, v in results.items() if v["status"] == "resolved"]
        propagation_complete = len(resolved_servers) >= 3  # At least 3/4 servers

        return {
            "domain": domain,
            "propagation_complete": propagation_complete,
            "servers_resolved": len(resolved_servers),
            "total_servers": len(dns_servers),
            "details": results
        }


# Singleton instance
dns_service = DNSVerificationService()
