# CLAUDE.md — Trust Wallet Assets Repository

## Repository Overview

This is the **Trust Wallet Assets** repository — a community-maintained collection of blockchain token metadata, logos, and configuration used by the Trust Wallet app. It contains:

- Token `info.json` metadata and `logo.png` images for 113+ blockchains
- dApp PNG icons
- A Go CLI tool to validate, fix, and manage all assets

**Module path**: `github.com/trustwallet/assets`  
**Go version**: 1.18  
**Config file**: `.github/assets.config.yaml`

---

## Directory Structure

```
assets/
├── blockchains/              # Asset data — one directory per blockchain
│   └── {chain}/
│       ├── info/             # Chain-level info.json and logo.png
│       ├── assets/
│       │   └── {address}/    # Token-level logo.png and info.json
│       ├── tokenlist.json    # Default token list
│       ├── tokenlist-extended.json
│       └── validators/       # Validator node assets (some chains)
├── dapps/                    # dApp PNG icons (lowercase filenames)
├── cmd/
│   └── main.go               # CLI entry point
├── internal/
│   ├── config/               # Config loading (Viper + mapstructure)
│   ├── manager/              # Cobra CLI command definitions + helpers
│   ├── processor/            # Validator and Fixer logic per file type
│   ├── report/               # Error counting and reporting
│   └── service/              # Orchestrates file traversal + job execution
├── .github/
│   ├── assets.config.yaml    # Validation rules configuration
│   └── workflows/            # GitHub Actions CI/CD
├── Makefile                  # All development commands
├── go.mod / go.sum
└── .golangci.yml             # Linter configuration (31 linters enabled)
```

---

## Development Commands

All common tasks are managed via `make`. Do **not** call `go run cmd/main.go` directly — use the Makefile targets.

| Command | Description |
|---|---|
| `make check` | Validate all assets (structure, JSON, images) |
| `make fix` | Auto-fix fixable issues (checksums, JSON formatting, image resizing) |
| `make update-auto` | Pull updates from external sources (e.g. Uniswap, PancakeSwap) |
| `make add-token asset_id=<id>` | Scaffold `info.json` template for a new token |
| `make add-tokenlist asset_id=<id>` | Add token to `tokenlist.json` |
| `make add-tokenlist-extended asset_id=<id>` | Add token to `tokenlist-extended.json` |
| `make test` | Run Go unit tests with race detection and coverage |
| `make fmt` | Format all Go source files with `gofmt` |
| `make lint` | Run `golangci-lint` (auto-installs v1.45.2 if missing) |
| `make all` | Run `fmt` + `lint` + `test` |

---

## Asset ID Format

Asset IDs follow the format `c{coinID}_t{tokenAddress}`, e.g. `c60_t0x6B175474E89094C44Da98b954EedeAC495271d0F`.

- `c60` = Ethereum (coin ID from `go-primitives`)
- `t0x...` = token contract address

---

## File & Folder Conventions

### Chain directory (`blockchains/{chain}/`)
- Folder name must be **lowercase**
- Allowed contents: `assets/`, `tokenlist.json`, `chainlist.json`, `tokenlist-extended.json`, `validators/`, `info/`

### Asset directory (`blockchains/{chain}/assets/{address}/`)
- Directory name must be the **checksum-formatted EVM address** (for EVM chains)
- Allowed files: `logo.png`, `info.json`

### Logos
- Format: PNG only
- Filename: `logo.png` (lowercase)
- Dimensions are validated and images are resized/compressed by `make fix`
- dApp logos live in `dapps/` as `{name}.png` (lowercase, no subdirectories)

### `info.json` schema (token asset)
```json
{
  "name": "Token Name",
  "website": "https://example.com",
  "description": "Short description.",
  "explorer": "https://explorer.url/token/0x...",
  "type": "ERC20",
  "symbol": "SYM",
  "decimals": 18,
  "status": "active",
  "id": "0xChecksumAddress",
  "links": [
    {"name": "github", "url": "https://github.com/..."},
    {"name": "twitter", "url": "https://twitter.com/..."}
  ]
}
```

### `tokenlist.json` schema
```json
{
  "name": "Trust Wallet: ChainName",
  "logoURI": "https://trustwallet.com/assets/images/favicon.png",
  "timestamp": "2024-01-01T00:00:00+00:00",
  "tokens": [
    {
      "chainId": 1,
      "asset": "c60_t0x...",
      "type": "ERC20",
      "address": "0x...",
      "name": "Token Name",
      "symbol": "SYM",
      "decimals": 18,
      "logoURI": "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x.../logo.png",
      "pairs": []
    }
  ]
}
```

---

## Go Source Code Conventions

### Code style
- Line length limit: **120 characters**
- Imports: group standard library, external, then local (`github.com/trustwallet` prefix is "local")
- Naming: `PascalCase` exported, `camelCase` unexported
- Comments on exported symbols must end with a period (godot linter rule)
- No `init()` functions (`gochecknoinits` linter)
- Cyclomatic complexity limit: 20; cognitive complexity limit: also enforced

### Architecture
The Go tool follows a layered service design:

```
cmd/main.go
  └── manager.InitCommands() + manager.Execute()
        └── service.Service{
              fileService:      file.Service       (traversal)
              processorService: processor.Service  (validate/fix dispatch)
              reportService:    report.Service     (error counting)
            }
```

- **`internal/config`**: Loads `.github/assets.config.yaml` via Viper; populates `config.Default`
- **`internal/manager`**: Cobra CLI setup; each command calls `InitAssetsService()` then a job
- **`internal/processor`**: Routes each `file.AssetFile` to its `[]Validator` or `[]Fixer` based on `f.Type()`. **Add new validators/fixers here.**
- **`internal/service`**: Walks file list, calls processors, accumulates errors via report service
- **`internal/report`**: Simple counter; `IsFailed()` causes non-zero exit when errors exist

### Key external libraries
| Package | Purpose |
|---|---|
| `github.com/trustwallet/assets-go-libs` | File traversal, path helpers, asset manager client, image tools |
| `github.com/trustwallet/go-primitives` | Coin IDs (`coin.Coins`), asset ID parsing (`asset.ParseID`) |
| `github.com/spf13/cobra` | CLI framework |
| `github.com/sirupsen/logrus` | Structured logging (log level set from config) |

---

## CI/CD Pipelines

All workflows live in `.github/workflows/`.

| Workflow | Trigger | Steps |
|---|---|---|
| `check.yml` | Push to `master`, manual | `make check` → `make test` → `make lint` |
| `pr-ci.yml` | All branches / PRs to master | Same as check.yml |
| `periodic-update.yml` | Cron 01:00 & 13:00 UTC | `make update-auto` → `make check` → auto-commit via bot |
| `fix.yml` | Manual | `make fix` |
| `fix-dryrun.yml` | Manual | Dry-run fix |
| `s3_upload.yml` | Manual | Upload assets to S3 |

Every PR is validated with the full check + lint pipeline. The bot user `trust-wallet-merge-bot` handles automated commits.

---

## Adding a New Token (Typical Workflow)

1. Create asset directory and scaffold:
   ```sh
   make add-token asset_id=c60_t0xYourTokenAddress
   ```
2. Fill in `blockchains/{chain}/assets/{address}/info.json` with complete metadata.
3. Add a 256×256 `logo.png` to the same directory.
4. Optionally add to the token list:
   ```sh
   make add-tokenlist asset_id=c60_t0xYourTokenAddress
   ```
5. Run `make check` to validate — fix any reported errors.
6. Run `make fix` to auto-fix formatting and image dimensions.
7. Re-run `make check` to confirm clean.

**Token requirements**: Active project, not brand-new, adequate market circulation. See the [contribution guide](https://developer.trustwallet.com/assets/requirements).

---

## Adding a New Validator or Fixer

1. Add the function to `internal/processor/validators.go` or `internal/processor/fixers.go`.
2. Register it in `internal/processor/service.go` inside `GetValidator()` or `GetFixers()` for the appropriate `file.Type*` case.
3. Run `make check` or `make fix` to test.

---

## Running Locally

```sh
# Validate all assets
make check

# Auto-fix issues
make fix

# Format Go code
make fmt

# Run linter
make lint

# Run tests
make test
```

No local server or database required — the tool operates entirely on the local file system.

---

## Important Constraints for AI Assistants

- **Never modify `go.sum` manually** — it is managed by `go mod tidy`.
- **Never add test files to the `blockchains/` or `dapps/` directories** — these are data directories.
- **Address directories for EVM chains must use checksum format** — run `make fix` to correct casing.
- **All PNG files must be named `logo.png`** (lowercase) — the validator enforces this.
- **JSON files must be valid and pretty-printed** — `make fix` handles formatting.
- **Do not add new Go dependencies without updating `go.mod` and `go.sum`** via `go get` + `go mod tidy`.
- **Line length cap is 120 chars** — the linter will fail otherwise.
- **The default config path is `.github/assets.config.yaml`** — do not rename or move it.
- **No `init()` functions** in Go code — the linter (`gochecknoinits`) will reject them.
- **The active development branch for documentation** is `claude/add-claude-documentation-TrUZJ`.
