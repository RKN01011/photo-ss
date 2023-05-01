import io
import asyncio

from PIL import Image, ImageFilter
from pymongo import MongoClient
from pymongo.database import Database

db = MongoClient('mongo', 27017)
photos: Database = db.photos


async def complete_photos():
    while True:
        it = photos.statistics.find({'state': 0})
        tasks = []
        for photo_data in it:
            current_photo_data = photo_data
            photos.statistics.update_one({'id': current_photo_data['id']}, {'$inc': {'state': 1}})

            async def as_f():
                file = Image.open(io.BytesIO(current_photo_data['file_data']))
                out_file = file.filter(ImageFilter.BLUR)
                out = io.BytesIO()
                out_file.save(out, 'PNG')
                photos.statistics.update_one({'id': current_photo_data['id']},
                                             {'$set': {'state': 2, 'file_data': out.getvalue()}})

            tasks.append(asyncio.create_task(as_f()))

        if not tasks:
            await asyncio.sleep(1)
            continue

        await asyncio.gather(*tasks)
        await asyncio.sleep(1)


async def main():
    complete_photos_task = asyncio.create_task(complete_photos())

    await asyncio.gather(complete_photos_task)


asyncio.run(main())
