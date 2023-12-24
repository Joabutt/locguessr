# LocGuessr 📍

A location guessing website powered by OpenAI's GPT-4 Vision. This is a simple proof of concept about the capabilities of the new OpenAI GPT-4 Vision model. The aim is to guess the location of an image using the power of advanced AI. The counter is reset daily to limit the number of times the image search can be queried.

## Project Structure
The main files in this project are:
- The `index.html` , which contains the main User Interface layout and interactivity mostly written in Vanilla JS, HTML and CSS. 
- `index.js`, a Node.js backend that interfaces with several APIs like Firebase for the realtime database counter (remove from your local copy if needed), and OpenAI's GPT-4-Vision. 

## Tech Stack
- Front-end: HTML, CSS, JavaScript
- Back-end: Node.js with Express.js
- External APIs: OpenAI GPT-4 Vision API, imgbb Image Hosting API
- Deployment: Hosted on Cyclic
- Additional Node.js libraries: axios, body-parser, dotenv, express-fileupload and form-data

## How to use
1. On launching the application, you are presented with an interface where you can upload an image.
2. Upon uploading an image, it is sent to the server for processing. 
3. GPT-4 vision analyses the uploaded image and makes an educated guess about where the image could be taken. 
4. The application displays the predicted location along with the relevant country flag. 

### Prerequisites
Ensure you have Node.js and npm/yarn installed. Also set up a Firebase Realtime database (if you want a counter) and Integrate your database and OpenAI GPT-4 Vision API with the application via environment variables.

## How to setup locally
After cloning the repository,

1. Install dependencies by running 
```bash
npm install 
```
or 
```bash
yarn
```
2. Copy the `.env.example` to `.env` in the root of your project and insert your keys in this format:
```env
OPENAI_API_KEY=<your_openai_key>
IMGBB_API_KEY=<your_imgbb_key>
RTDB_URL=<your_firebase_realtime_database_url>
```
The database URL is the URL of your Firebase Realtime Database, and the keys are your respective OpenAI and Imgbb API keys.

3. Set up Firebase Admin SDK private key file on project root and ensure the relative path to the `.json` file is correctly referenced in `index.js`.

4. Run the app:
```bash
node index.js
```
The application serves static files from the root directory and runs on port 5000. You can access locally with http://localhost:5000

> Note: This project resets the counter for queries everyday. Be sure to check your OpenAI GPT-4 Vision API usage to avoid surpassing quota.


## Contributing
Any contributions are welcome! Please check our [contributing guide](./CONTRIBUTING.md) for further details.

## Support this project
Give this repository a ⭐ if it helped you!


