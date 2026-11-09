const button = document.getElementById("loadUsers");
const usersContainer = document.getElementById("users");

button.addEventListener("click", async () => {
    usersContainer.innerHTML = "Loading users...";

    try {
        const response = await fetch(
            "http://localhost:4000/api/users"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const users = await response.json();

        usersContainer.innerHTML = "";

        users.forEach(user => {
            const div = document.createElement("div");

            div.className = "user";
            div.textContent = `${user.id}. ${user.name}`;

            usersContainer.appendChild(div);
        });

    } catch (error) {
        usersContainer.textContent = error.message;
        console.error(error);
    }
});
