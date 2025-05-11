import http from "http";
import { server } from "../src/server";
import { User } from "../src/api/models/userModel";

const makeRequest = (options: http.RequestOptions, body?: object) => {
  return new Promise<{ statusCode: number; data: string }>(
    (resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 500, data });
        });
      });

      req.on("error", (e) => {
        console.error(`Request error: ${e.message}`);
        reject(e);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    }
  );
};

describe("User API test scenarios", () => {
  let userId: string;

  beforeAll((done) => {
    if (!server.listening) {
      console.error("Server is not running!");
    } else {
      console.log(`Server is running on port 4000`);
    }
    done();
  });

  afterAll((done) => {
    console.log("Closing server...");
    server.close((err) => {
      if (err) {
        console.error("Error closing server:", err);
        done(err);
      } else {
        console.log("Server closed successfully");
        done();
      }
    });
  });

  it("should return an empty array when no users exist", async () => {
    const options = {
      hostname: "localhost",
      port: 4000,
      path: "/api/users",
      method: "GET",
    };

    try {
      const { statusCode, data } = await makeRequest(options);
      const response = JSON.parse(data);

      console.log("Response data:", response);

      expect(statusCode).toBe(200);
      expect(response).toEqual([]);
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });

  it("should create a new user", async () => {
    const userData: Omit<User, "id"> = {
      username: "JohnDoe",
      age: 30,
      hobbies: ["reading", "sports"],
    };

    const postOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/users",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const postResponse = await makeRequest(postOptions, userData);
    const createdUser = JSON.parse(postResponse.data);

    expect(postResponse.statusCode).toBe(201);
    expect(createdUser.username).toBe(userData.username);

    userId = createdUser.id;
    console.log(`Created user ID: ${userId}`);
  });

  it("should retrieve the created user by ID", async () => {
    const getOptions = {
      hostname: "localhost",
      port: 4000,
      path: `/api/users/${userId}`,
      method: "GET",
    };

    const getResponse = await makeRequest(getOptions);
    const retrievedUser = JSON.parse(getResponse.data);

    expect(getResponse.statusCode).toBe(200);
    expect(retrievedUser.id).toBe(userId);
    expect(retrievedUser.username).toBe("JohnDoe");
  });

  it("should update the user", async () => {
    const updatedUserData: Omit<User, "id"> = {
      username: "JaneDoe",
      age: 28,
      hobbies: ["music", "traveling"],
    };

    const putOptions = {
      hostname: "localhost",
      port: 4000,
      path: `/api/users/${userId}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const putResponse = await makeRequest(putOptions, updatedUserData);
    const updatedUser = JSON.parse(putResponse.data);

    expect(putResponse.statusCode).toBe(200);
    expect(updatedUser.username).toBe(updatedUserData.username);
    expect(updatedUser.age).toBe(updatedUserData.age);
  });

  it("should delete the user", async () => {
    const deleteOptions = {
      hostname: "localhost",
      port: 4000,
      path: `/api/users/${userId}`,
      method: "DELETE",
    };

    const deleteResponse = await makeRequest(deleteOptions);
    expect(deleteResponse.statusCode).toBe(204);

    const getOptions = {
      hostname: "localhost",
      port: 4000,
      path: `/api/users/${userId}`,
      method: "GET",
    };

    const getResponse = await makeRequest(getOptions);
    expect(getResponse.statusCode).toBe(404);
  });

  it("should return an error when creating a user with invalid data", async () => {
    const invalidUserData = {
      username: "",
      age: -1,
      hobbies: [""],
    };

    const postOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/users",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const postResponse = await makeRequest(postOptions, invalidUserData);
    expect(postResponse.statusCode).toBe(400);
  });

  it("should return an error when updating a non-existent user", async () => {
    const nonExistentUserId = "42efffa7-13fe-4288-a578-095c03a0a702";

    const updatedUserData: Omit<User, "id"> = {
      username: "NonExistentUser",
      age: 40,
      hobbies: ["nothing"],
    };

    const putOptions = {
      hostname: "localhost",
      port: 4000,
      path: `/api/users/${nonExistentUserId}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const putResponse = await makeRequest(putOptions, updatedUserData);
    expect(putResponse.statusCode).toBe(404);
  });
});
