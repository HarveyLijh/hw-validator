export function openModal(title, content) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = content;
  document.getElementById("modal").classList.add("active");
}

export function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

// Make closeModal globally available for inline onclick handlers
window.closeModal = closeModal;
