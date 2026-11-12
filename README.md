## Tune browser extension

- connects to tune-backend (Behind a NAT/Private Network by default, can be changed in env)
- checks if track exist by provider
- download new tracks
- check if tracks exist

### Providers implemented

- [x] youtube
- [ ] soundcloud
- [ ] bandcamp

Maybe other providers will be added in the future.

#### Dev

- from ci folder check env variables, then create your .evn file and paste them there.

With Docker Compose, run either browser's development build from this directory:

```sh
docker compose -f ./compose.dev.yml up --build tune-extension-chrome-dev
```

or

```sh
docker compose -f ./compose.dev.yml up --build tune-extension-firefox-dev
```

or both

```sh
docker compose -f ./compose.dev.yml up --build
```

Run commands:

```
- pnpm i
- pnpm postinstall
- pnpm gen
- pnpm dev
```
