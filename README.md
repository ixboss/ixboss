<p align="center">
  <img src="assets/hero.svg" alt="BOSS — systems-level developer. Rotating lines: systems-level work with ACPI and Embedded Controller, then Swift, Kotlin, C++ and JavaScript with no cloud in the middle." width="760">
</p>

<p align="center">
  <sub>Just some nerd student who loves to play with everything he sees.</sub>
</p>

<p align="center">
  <a href="mailto:hossam.m.ghareeb@gmail.com">Email</a> ·
  <a href="https://www.tiktok.com/@ixbossss">TikTok</a> ·
  <a href="https://www.instagram.com/ixbosss">Instagram</a> ·
  <a href="https://github.com/ixboss?tab=repositories">Repositories</a>
</p>

Most of what I build sits one layer below the app: system-level tooling that talks to laptop firmware and Embedded Controllers, an AI runtime that boots from a USB stick and follows you onto an Android phone, and cross-platform apps for macOS, Android and the web.

<img src="assets/divider.svg" alt="" width="760">

## Selected work

<img src="assets/projects/asus-control-macos.svg" alt="asus-control-macos" width="760">

A native macOS control suite for ASUS ROG and TUF gaming laptops, written in SwiftUI with a kernel extension that bridges user space to the machine's ACPI/WMI interface and Embedded Controller. An open-source answer to Armoury Crate and G-Helper.

- **Battery charge limits** at 60, 80 or 100 %, written through the ASUS ACPI interface.
- **Silent, Balanced and Turbo** firmware profiles, plus explicit PL1/PL2 CPU power limits on Alder Lake.
- **Eight-point fan curves** read and programmed into EC registers, with hardware guardrails.

Built with Swift and SwiftUI, backed by an IOKit kernel extension and a little C++ at the ACPI boundary.

Verified on a TUF Gaming F17 (FX707ZM) under Ventura, Sonoma and Sequoia. Known limit: keyboard RGB stays unlit under macOS on TUF models, while battery, fan and thermal control still work.

[**Repository →**](https://github.com/ixboss/asus-control-macos) · [**Release →**](https://github.com/ixboss/asus-control-macos/releases)

<img src="assets/projects/universal-harness.svg" alt="universal-harness" width="760">

A portable runtime that makes DeepSeek Harness run anywhere — a USB stick, a desktop, an Android phone — and be driven from another machine over the LAN, with no cloud in the middle.

- **Truly portable** — bundled Node runtime, relative paths only, exFAT-safe; the folder moves between machines with its sessions intact.
- **Node-authoritative sessions** — a task keeps running when the controller disconnects, and missed events replay on reconnect.
- **LAN-first pairing** — mDNS discovery, QR pairing, TLS with pinned certificates and an Ed25519 challenge-response.

Built with Kotlin on the Android node, Node.js for the portable core, and C where it meets the platform.

Status, honestly: phases 0 through 3C are implemented and verified on Windows x64 and on a physical Android device. Linux and macOS are still untested, and synchronization, updates and terminal execution remain out of scope.

[**Repository →**](https://github.com/ixboss/universal-harness)

<img src="assets/projects/sadaqa-jaria.svg" alt="sadaqa-jaria" width="760">

A free Quran app that works offline: a 604-page Mushaf, tafsir, five reciters, khatmah tracking and daily adhkar. No account, no ads, no tracking — everything you do stays on your device.

- **Reads offline** — service-worker precache, plus a one-tap download of the full Quran into IndexedDB.
- **Mushaf mode** — 604 pages with a finger-driven 3D page turn, or continuous scroll.
- **Khatmah tracker** — daily portion plan, a personal intention, and the history of completed khatmahs.

Built with vanilla JavaScript, a service worker and Capacitor for the app wrappers — no framework, no bundler, no build step. Offered as sadaqah jariyah.

[**Open the app →**](https://ixboss.github.io/sadaqa-jaria/) · [**Repository →**](https://github.com/ixboss/sadaqa-jaria)

<img src="assets/divider.svg" alt="" width="760">

## Stack

<p align="center">
  <img src="assets/stack.svg" alt="Icons for five stack categories: Languages, Platforms, Frameworks, Systems, AI and tooling" width="470">
</p>

- **Languages** — Swift · Kotlin · JavaScript · C / C++ · Python
- **Platforms** — macOS · Android · Windows · Linux
- **Frameworks & runtimes** — SwiftUI · Node.js · Capacitor · Flutter
- **Systems** — IOKit kernel extensions · ACPI / Embedded Controller · CMake
- **AI & tooling** — DeepSeek Harness · JSON-RPC adapters · LAN protocols

<img src="assets/divider.svg" alt="" width="760">

## Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/snake/snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/snake/snake-light.svg">
  <img alt="Animated contribution graph, where a snake moves across the contribution cells" src="assets/snake/snake-light.svg" width="760">
</picture>

173 contributions in the last year across four public repositories — as of November 2026.
