# Security Policy

## Reporting a vulnerability

If you discover a security issue in VERSA, please report it privately rather
than opening a public issue. Open a
[GitHub security advisory](https://github.com/hasbunallah01/VERSA/security/advisories)
or contact the maintainer directly.

Please include steps to reproduce and the potential impact. We aim to
acknowledge reports promptly.

## Handling of secrets

- API keys (`OPENAI_API_KEY`, `ETHERSCAN_API_KEY`) and payment configuration are
  provided via environment variables and are never committed to the repository.
- `.env*` files are git-ignored (except `.env.example`, which contains no real
  values).
- The x402 receiving wallet address is public by design; no private keys are
  ever stored in this project.
