# Figma Plugin (React + VKUI)

Готовый скелет плагина с UI на React + VKUI и сборкой через Vite (для UI) и esbuild (для code.ts).

## Установка
```bash
npm i
```

## Разработка
В двух терминалах:

1) Соберите UI в `dist/` (production-сборка) при изменениях:
```bash
npm run build:ui -- --watch
```
2) Сборка `code.ts` в watch-режиме:
```bash
npm run watch:code
```
3) В Figma Desktop: `Plugins → Development → Import plugin from manifest…` (укажите корневой `manifest.json` или `dist/manifest.json`).
4) После каждого сохранения кода → `Plugins → Development → Reload plugins`, затем заново запустите плагин.

> HMR в iframe Figma из коробки не работает, поэтому цикл — сборка → reload плагинов.

## Использование VKUI
Пишите интерфейс в `src/ui/main.tsx` VKUI‑компонентами. CSS VKUI уже подключён (`@vkontakte/vkui/dist/vkui.css`).

## Сборка релиза
```bash
npm run build
```
Артефакты будут в `dist/`, туда же копируется `manifest.json`.
