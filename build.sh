#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Форсируем правильную версию Python ---"
# Устанавливаем virtualenv и создаем окружение в обход системной ошибки
pip install virtualenv
virtualenv --python=python3.11 .venv
source .venv/bin/activate

echo "--- Устанавливаем библиотеки кружка ---"
pip install --upgrade pip
cd backend && pip install -r requirements.txt
