# IE221-DoAnPython

Yêu cầu app:

```
(.venv) [harch@archlinux IE221-DoAnPython]$ npm -v
11.11.0
(.venv) [harch@archlinux IE221-DoAnPython]$ node -v
v25.7.0
(.venv) [harch@archlinux IE221-DoAnPython]$ python --version
Python 3.14.3
```

Techstack:

- Python, sqlite, fastapi, react, vitejs

Start app:

1. cd vào `/app` chạy `python -m pip install -r requirements.txt`
2. chạy lệnh start app: `uvicorn app.main:app --reload`
3. xem swagger docs tại `http://127.0.0.1:8000/docs` sau khi start

Start web:

1. cd vào `/web`, chạy `npm install` trước
2. start web `npm run dev`

Web:

<img width="1356" height="1311" alt="image" src="https://github.com/user-attachments/assets/ea07e1b9-ae79-4d2e-bb4c-7de421e96af7" />

