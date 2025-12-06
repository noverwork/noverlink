# Homebrew Tap for Noverlink

## Installation

```bash
brew tap noverwork/noverlink https://github.com/noverwork/noverlink
brew install noverlink
```

Or directly:

```bash
brew install noverwork/noverlink/noverlink
```

## Usage

```bash
# Start a tunnel to localhost:3000
nvl http 3000

# Login to your account
nvl login
```

## Updating

```bash
brew upgrade noverlink
```

## Setup (for maintainers)

When releasing a new version:

1. Build release binaries for all platforms
2. Calculate SHA256 checksums:
   ```bash
   shasum -a 256 noverlink-*.tar.gz
   ```
3. Update `Formula/noverlink.rb` with new version and checksums
4. Push changes
