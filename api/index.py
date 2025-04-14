from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Instagram Downloader for Reels, Posts, IGTV, Stories (Public Only)"}

@app.get("/download")
def download(url: str = Query(..., description="Instagram media URL (post, reel, igtv, story)")):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        media_data = {}

        # Try for video (Reels, Video Posts, IGTV)
        video_tag = soup.find("meta", property="og:video")
        if video_tag and video_tag.get("content"):
            media_data["media_type"] = "video"
            media_data["url"] = video_tag["content"]
            return {"status": "success", **media_data}

        # Try for image (Photo Posts, Covers, Stories)
        image_tag = soup.find("meta", property="og:image")
        if image_tag and image_tag.get("content"):
            media_data["media_type"] = "image"
            media_data["url"] = image_tag["content"]
            return {"status": "success", **media_data}

        return {"status": "error", "message": "No downloadable media found (check if public)"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})
