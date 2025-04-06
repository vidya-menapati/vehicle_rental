// Handle form submission
document.getElementById('reviewForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;

    const response = await fetch('/submit-review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, rating, review }),
    });

    if (response.ok) {
        document.getElementById('reviewMessage').textContent = 'Review submitted successfully!';
        loadReviews();
    } else {
        document.getElementById('reviewMessage').textContent = 'Error submitting review';
    }
});

// Load and display reviews
async function loadReviews() {
    const response = await fetch('/reviews');
    const reviews = await response.json();

    const reviewsSection = document.getElementById('reviews');
    reviewsSection.innerHTML = '';

    reviews.forEach((review) => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('review-card');
        
        reviewCard.innerHTML = `
            <h2>${review.name}</h2>
            <p>${'⭐'.repeat(review.rating)}</p>
            <p>${review.review}</p>
            <small>Reviewed on: ${new Date(review.createdAt).toLocaleDateString()}</small>
        `;
        reviewsSection.appendChild(reviewCard);
    });
}

// Load reviews when the page loads
loadReviews();
