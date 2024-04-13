document.addEventListener('DOMContentLoaded', () => {
    const classnotesForm = document.getElementById('classnotes-form');
    const classnotesList = document.getElementById('classnotes-list');

    // Function to fetch files from the server and update the UI
    async function fetchFiles() {
        try {
            const response = await fetch('/files');
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            const files = await response.json();
            console.log(files);
            // Clear existing file list
            classnotesList.innerHTML = '';
            // Append each file to the list
            files.forEach(async file => {
                const listItem = document.createElement('div');
                // Create anchor tag for downloading file
                const downloadLink = document.createElement('a');
                downloadLink.href = `/download/${file._id}`; // Set the download route for the file
                downloadLink.textContent = file.filename; // Display file name
                downloadLink.download = file.filename; // Set the file name for downloading
                listItem.appendChild(downloadLink);
                
                // Fetch comments for this file
                const comments = await fetchComments(file._id);
                // Display comments
                const commentList = document.createElement('ul');
                comments.forEach(comment => {
                    const commentItem = document.createElement('li');
                    commentItem.textContent = comment.text;
                    commentList.appendChild(commentItem);
                });
                listItem.appendChild(commentList);
                classnotesList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error:', error);
            // Handle the error
        }
    }

    // Function to add comment to a file
    async function addComment(fileId, commentText) {
        try {
            const response = await fetch(`/files/${fileId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: commentText })
            });
            if (!response.ok) {
                throw new Error('Failed to add comment');
            }
            const responseData = await response.json();
            console.log(responseData);
            // Optionally, update the UI to reflect the added comment
        } catch (error) {
            console.error('Error:', error);
            // Handle the error
        }
    }

    // Function to fetch comments for a file
    async function fetchComments(fileId) {
        try {
            const response = await fetch(`/files/${fileId}/comments`);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            const comments = await response.json();
            console.log(comments);
            return comments;
        } catch (error) {
            console.error('Error:', error);
            // Handle the error
            return [];
        }
    }

    // Event listener for form submission
    classnotesForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent the default form submission behavior

        const formData = new FormData(this); // 'this' refers to the form element

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const responseData = await response.json();
            console.log(responseData); // Log the response from the server

            // Fetch and display updated list of files after successful upload
            fetchFiles();
        } catch (error) {
            console.error('Error:', error);
            // Optionally, display an error message or handle the error
        }

        // Reset the form after submission
        this.reset();
    });

    // Fetch files when the page loads
    fetchFiles();
});
