import uvicorn
import asyncio
import io

from uuid import uuid4
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi import FastAPI, UploadFile, File

from sse_starlette.sse import EventSourceResponse

from pymongo import MongoClient
from pymongo.database import Database

db = MongoClient('mongo', 27017)
photos: Database = db.photos

app = FastAPI()

STREAM_DELAY = 5  # second
RETRY_TIMEOUT = 15000  # milisecond

print(photos.statistics)

@app.get('/stream')
async def message_stream():
    async def event_generator():
        while True:
            ids = [d['id'] for d in photos.statistics.find() if d['state'] == 2]
            if ids:
                yield ids

            await asyncio.sleep(STREAM_DELAY)

    return EventSourceResponse(event_generator(), headers={'Access-Control-Allow-Origin': '*'})


@app.get('/get_photo')
def get_photo(photo_id):
    photo_data = list(photos.statistics.find({'id': photo_id}))[0]
    photos.statistics.delete_one({'id': photo_id})
    data = io.BytesIO(photo_data['file_data'])

    def iter_data():
        yield from data

    return StreamingResponse(iter_data(), media_type="image/png", headers={
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    })


@app.options('/send_photo/')
def send_photo_post():
    return JSONResponse(headers={
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    }, content={'code': 200})


@app.post('/send_photo/')
def send_photo(image: UploadFile = File(...)):
    photo_id = str(uuid4())
    photos.statistics.insert_one({'id': photo_id, 'state': 0, 'file_data': image.file.read()})

    return JSONResponse(headers={
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    }, content={'id': photo_id})


if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
