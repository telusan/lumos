#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Форсируем правильную версию Python ---"
# Создаем чистое виртуальное окружение на стабильной версии 3.11
python3.11 -m venv .venv
source .venv/bin/activate

echo "--- Устанавливаем библиотеки ---"
pip install --upgrade pip
cd backend && pip install -r requirements.txt
