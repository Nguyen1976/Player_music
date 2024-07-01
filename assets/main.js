import { getSong } from '../modules/api.js';
import { getConfig, setConfig } from '../modules/config.js';
import { $, $$, renderPlaylist, updateCurrentSong } from '../modules/dom.js';

const cdThumb = $('.cd-thumb');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const iconPlay = $('.btn-toggle-play i');
const audio = $('#audio');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    songs: [],
    config: getConfig(),

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },

    handleEvents: function() {
        

        const cdWidth = cd.offsetWidth;
        const cdHeight = cd.offsetHeight;

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            const newCdHeight = cdHeight - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.height = newCdHeight > 0 ? newCdHeight + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        playBtn.onclick = function() {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }

            audio.onplay = function() {
                iconPlay.classList.replace('fa-play', 'fa-pause');
                cdThumbAnimate.play();
            };

            audio.onpause = function() {
                iconPlay.classList.replace('fa-pause', 'fa-play');
                cdThumbAnimate.pause();
            };
        };

        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        };

        progress.oninput = function() {
            const seekTime = (this.value * audio.duration / 100);
            audio.currentTime = seekTime;
        };

        nextBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        };

        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.prevSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        };

        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        };

        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;
            setConfig('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle('active', app.isRepeat);
        };

        audio.onended = function() {
            if (app.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        playlist.onclick = function(e) {
            if (e.target.closest('.song:not(.active)') || e.target.closest('.option')) {
                if (e.target.closest('.song:not(.active)')) {
                    let songNode = e.target.closest('.song:not(.active)');
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                    app.render();
                }

                if (e.target.closest('.option')) {
                    // Xử lý khi click vào option
                }
            }
        };
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 100);
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    loadCurrentSong: function() {
        updateCurrentSong(this.currentSong);
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function() {
        getSong((data) => {
            this.songs = data;
            this.loadConfig();
            this.defineProperties();
            this.handleEvents();
            this.loadCurrentSong();
            this.render();
            const randomBtn = $('.btn-random');
            const repeatBtn = $('.btn-repeat');
            randomBtn.classList.toggle('active', this.isRandom);
            repeatBtn.classList.toggle('active', this.isRepeat);
        });
    },

    render: function() {
        renderPlaylist(this.songs, this.currentIndex);
    }
}

app.start();