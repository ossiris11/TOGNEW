import cv2
import os
import sys

def extract_frames(video_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    vidcap = cv2.VideoCapture(video_path)
    success, image = vidcap.read()
    count = 1
    
    while success:
        frame_name = f"frame_{count:04d}.jpg"
        cv2.imwrite(os.path.join(output_dir, frame_name), image)
        success, image = vidcap.read()
        count += 1
        
    print(f"Extracted {count-1} frames")

if __name__ == "__main__":
    extract_frames(sys.argv[1], sys.argv[2])
