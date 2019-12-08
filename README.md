# COMP4651-Project
This project will demostrate how we trasnformed our model into a tensorflow.js and host it as an API on node.js.

## Run the server

1. Install `Docker` and `Docker Compose`
2. Run `docker-compose up --build` on project directory

## API Gateway

### Classify and save the question

* ***URL:***

  `/`

* **Method:**

  `POST`
  
* **Data Params**

  The data should be sent with JSON data structure
  
  **Required:**
  
   `content` - The question you want to save and classify and save<br/>
   `apikey` - The API key (`dbaeae2a-c663-4359-ae22-6496eafa1679` is the API key for this demo)

* **Success Response:**

  * **result:** true <br />
    **prediction:** The prediction of the model

### Get the full list of questions

* ***URL:***

  `/`

* **Method:**

  `GET`
  
* **Success Response:**

  A list of saved result
  
### Classify and save the question

* ***URL:***

  `/topic/[topic_id]`

* **Method:**

  `GET`

* **Success Response:**

  A list of saved result of the selected topic
