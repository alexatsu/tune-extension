## Tune browser extension

- connects to tune-backend (Behind a NAT/Private Network)
- checks if track exist by provider
- download new tracks
- mark tracks for deletion

### Providers implemented

- [x] youtube
- [ ] soundcloud
- [ ] bandcamp

Maybe other providers will be added in the future.

#### Dev

- from ci folder check env variables, then create your .evn file and paste them there.

Run commands:

```
- pnpm i
- pnpm postinstall
- pnpm gen
- pnpm dev
```
