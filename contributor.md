# Installation guide

## Clone the project :

  ```bash
  $ git clone https://github.com/1pizzateam/LoopR.js.git
  ```

## Launch with docker

  ```bash
  $ cd LoopR.js/
  $ docker-compose up -d
  ```

  That builds the library (`loopr`), then starts the VitePress docs site (`website`)
  once the build succeeds. Open **http://localhost:5173/docs/**.

  The docs demos import `@1pizzateam/loopr`, which always resolves to `dist/`,
  so rebuild the library to see source changes on the site.

OR

## Install project dependencies :

  ```bash
  $ cd LoopR.js/
  $ npm i
  ```

# Workflow

1. Create a branch 
2. Make your changes
3. Build and test the library
4. Sync your branch with main
5. Commit your work 
6. Push your branch and open a pull request against main

## Folders

- scripts/
- dist/
- src/
- tests/
- website/
