// Impact Chart
const ctx = document.getElementById('impactChart');
const impactChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Meals Donated', 'Food Waste Reduced'],
    datasets: [{
      label: 'Impact',
      data: [1000, 500],
      backgroundColor: ['#4CAF50', '#FFC107'], // Green and Gold
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

const sections = document.querySelectorAll('section');
const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

const checkVisibility = () => {
  // Section Animations
  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    const sectionBottom = section.getBoundingClientRect().bottom;
    if (sectionTop < window.innerHeight && sectionBottom > 0) {
      section.classList.add('visible');
    }
  });

  // Element Animations
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    if (elementTop < window.innerHeight && elementBottom > 0) {
      element.classList.add('visible');
    }
  });
};

// Image Preview Functionality
const foodImageInput = document.getElementById('food-image');
const imagePreview = document.getElementById('image-preview');

foodImageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Food Preview">`;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = '<p>No image selected.</p>';
  }
});

window.addEventListener('scroll', checkVisibility);
window.addEventListener('load', checkVisibility);

function initMap() {
  // Default location (e.g., Riyadh, Saudi Arabia)
  const defaultLocation = { lat: 24.7136, lng: 46.6753 };

  // Create a map centered at the default location
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: defaultLocation,
  });

  // Add a marker at the default location
  new google.maps.Marker({
    position: defaultLocation,
    map: map,
    title: "Default Location",
  });
}

//Ai chat bot
document.addEventListener("DOMContentLoaded", function () {
  const chatContainer = document.getElementById("chat-container");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const imageInput = document.getElementById("image-input");
  const imagePreview2 = document.getElementById("image-preview");
  const loadingIndicator = document.getElementById("loading");

  // API Config
  const OPENROUTER_API_KEY = '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';

  let currentImageData = null;

  // Add user message to chat
  function addUserMessage(text) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "message user-message";
      messageDiv.textContent = text;
      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Add bot message to chat
  function addBotMessage(text) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "message bot-message";
      messageDiv.textContent = text;
      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Handle image upload
  imageInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              currentImageData = e.target.result;
              imagePreview2.src = currentImageData;
              imagePreview2.style.display = "block";
          };
          reader.readAsDataURL(file);
      }
  });

  // Send message to AI API
  async function sendMessage(text) {
      if (!text.trim()) return; // Ignore empty messages

      loadingIndicator.style.display = "inline";
      addUserMessage(text);
      messageInput.value = ""; // Clear input

      let messages = [{ "role": "user", "content": [{ "type": "text", "text": text }] }];

      if (currentImageData) {
          messages[0].content.push({
              "type": "image_url",
              "image_url": { "url": currentImageData }
          });
      }

      try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  "model": "google/gemini-2.0-pro-exp-02-05:free",
                  "messages": messages,
                  "max_tokens": 150
              })
          });

          const data = await response.json();
          
          if (data.choices && data.choices[0] && data.choices[0].message) {
              addBotMessage(data.choices[0].message.content);
          } else {
              addBotMessage("Sorry, I couldn't process your request.");
              console.error("Unexpected API response:", data);
          }
      } catch (error) {
          addBotMessage("Error: Couldn't connect to the AI service.");
          console.error("API error:", error);
      } finally {
          loadingIndicator.style.display = "none";
          currentImageData = null;
          imagePreview.style.display = "none";
          imageInput.value = "";
      }
  }

  // Event listener for send button
  document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.getElementById("send-button");
    const messageInput = document.getElementById("message-input");

    sendButton.addEventListener("click", function () {
        sendMessage(messageInput.value);
    });
});

  // Event listener for Enter key
  messageInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
          sendButton.click();
      }
  });
});

