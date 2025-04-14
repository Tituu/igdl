from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup

app = FastAPI()

@app.get("/")
async def home():
    return {"message": "Instagram Downloader API is working!"}

@app.get("/download")
async def download(url: str):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        r = requests.get(url, headers=headers)
        soup = BeautifulSoup(r.text, 'html.parser')
        video_tag = soup.find('meta', property='og:video')

        if video_tag:
            video_url = video_tag['content']
            return {"status": "success", "video_url": video_url}
        else:
            return {"status": "error", "message": "Video not found or private"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})
