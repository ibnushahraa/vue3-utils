# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.6] - 2025-01-29

### Fixed
- **useGoogleLogin**: Replace `prompt()` with `renderButton()` approach to avoid FedCM CORS issues and improve browser compatibility

## [0.0.5] - 2025-01-28

### Added
- **useGoogleLogin**: Wrapper untuk Google Sign-In dengan auto SDK injection dan popup-based authentication
- **useFacebookLogin**: Wrapper untuk Facebook Login dengan auto SDK injection dan popup-based authentication

## [0.0.4] - 2025-01-20

### Added
- **useRandomWords**: Composable untuk menampilkan kata/kalimat secara random dengan dukungan filtering berdasarkan kategori
- **useTheme**: Composable untuk dark/light theme management dengan localStorage persistence dan auto-detect system preference (Tailwind CSS v4)
- **useDevice**: Composable untuk mendeteksi tipe device (mobile/tablet/desktop) berdasarkan window size dengan reactive state

## [0.0.3] - 2025-01-19

### Fixed
- **useEventBus**: Perbaikan lazy initialization

## [0.0.2] - 2025-01-17

### Added

#### Testing Infrastructure
- **Test Suite**: Penambahan folder `test/` dengan comprehensive test coverage menggunakan Vitest
- **GitHub Actions**: Setup automated testing dan coverage reporting via CI/CD
- **Coverage Tracking**: Integrasi coverage badge untuk monitoring test coverage

## [0.0.1] - 2025-01-17

### Added

#### Composables
- **useCountdown**: Timer countdown dengan event handlers untuk expired dan success
- **useTimeAgo**: Tampilan waktu relatif multi-bahasa dengan auto-update setiap menit
- **useCountUp**: Animasi count up dengan easing dan formatting lengkap
- **useTypewriter**: Efek typing animation dengan multiple texts dan cursor berkedip
- **useSSE**: Server-Sent Events dengan auto-reconnection dan custom event handlers
- **useClipboard**: Copy text ke clipboard dengan automatic fallback untuk browser lama

#### Wrappers
- **useEventBus**: Akses global event bus untuk komunikasi antar komponen
- **useFetch**: HTTP fetch dengan smart caching dan request cancellation
- **useAuthGuard**: Helper untuk memeriksa expirasi token
- **useFetchServer**: Fetch dengan automatic token management dan refresh
- **useDateTime**: Manipulasi dan formatting tanggal/waktu dalam Bahasa Indonesia
- **useCurrency**: Formatter angka ke format Rupiah Indonesia (IDR)

#### Documentation
- Comprehensive README dengan usage examples untuk semua utilities
- Full JSDoc documentation dengan type hints
- TypeScript type definitions (.d.ts) untuk semua composables dan wrappers

### Infrastructure
- Setup initial repository structure
- Package configuration dengan ES modules support
- Peer dependency untuk Vue 3.x

---

## Version Format

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

## Links

- [Repository](https://github.com/ibnushahraa/vue3-utils)
- [Issues](https://github.com/ibnushahraa/vue3-utils/issues)

[Unreleased]: https://github.com/ibnushahraa/vue3-utils/compare/v0.0.6...HEAD
[0.0.6]: https://github.com/ibnushahraa/vue3-utils/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/ibnushahraa/vue3-utils/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/ibnushahraa/vue3-utils/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/ibnushahraa/vue3-utils/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/ibnushahraa/vue3-utils/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/ibnushahraa/vue3-utils/releases/tag/v0.0.1
