export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);

export function renderPlaylist(songs, currentIndex) {
    const playlist = $('.playlist');
    const htmls = songs.map((song, index) => {
        return `
            <div class="song ${index === currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background: url(${song.image}) no-repeat center / cover;"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `;
    });
    playlist.innerHTML = htmls.join('');
}

export function updateCurrentSong(currentSong) {
    const heading = $('header h2');
    const cdThumb = $('.cd-thumb');
    const audio = $('#audio');

    heading.textContent = currentSong.name;
    cdThumb.style.backgroundImage = `url('${currentSong.image}')`;
    audio.src = currentSong.path;
}
