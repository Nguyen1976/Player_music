const songApi = 'http://localhost:3000/courses';

export function getSong(callback) {
    fetch(songApi)
        .then(response => response.json())
        .then(data => {
            if(callback) callback(data);
        })
        .catch(error => {
            console.error('Lỗi lấy dữ liệu bài hát', error);
        });
}