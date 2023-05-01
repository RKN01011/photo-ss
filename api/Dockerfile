FROM python:3.7

WORKDIR /usr/app/api/

COPY . /usr/app/api/
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "main.py"]
