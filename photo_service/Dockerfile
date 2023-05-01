FROM python:3.7

WORKDIR /usr/app/photo_service/

COPY . /usr/app/photo_service/
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "main.py"]
