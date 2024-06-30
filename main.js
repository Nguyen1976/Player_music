/**
 * 1.Render songs
 * 2.Scroll top
 * 3.Play / pause /seek
 * 4.CD rotato
 * 5.Next / prev
 * 6.Random
 * 7.Next / Repeat when ended
 * 8.Active song
 * 9.Scroll active song into view
 * 10.Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER';

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const iconPlay = $('.btn-toggle-play i');
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
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đừng làm trái tim anh đau',
            singer: 'Sơn Tùng MTP',
            path: './mp3/DLTTAD.mp3',
            image: './img/DLTTAD.jpg'
        },
        {
            name: 'Muộn rồi mà sao còn',
            singer: 'Sơn Tùng MTP',
            path: './mp3/MRMSC.mp3',
            image: './img/MRMSC.jpg'
        },
        {
            name: 'Nơi này có anh',
            singer: 'Sơn Tùng MTP',
            path: './mp3/NNCA.mp3',
            image: './img/NNCA.jpg'
        },
        {
            name: 'Có chắc yêu là đây',
            singer: 'Sơn Tùng MTP',
            path: './mp3/CCYLD.mp3',
            image: './img/CCYLD.jpg'
        },
        {
            name: 'Chúng ta của hiện tại',
            singer: 'Sơn Tùng MTP',
            path: './mp3/CTCHT.mp3',
            image: './img/CTCHT.jpg'
        },
        {
            name: 'Hãy trao cho anh',
            singer: 'Sơn Tùng MTP',
            path: './mp3/HTCA.mp3',
            image: './img/HTCA.jpg'
        },
        {
            name: 'Lạc trôi',
            singer: 'Sơn Tùng MTP',
            path: './mp3/LT.mp3',
            image: './img/LT.jpg'
        },
    ],
    setConfig: function(key, value) {
        // Cập nhật config với giá trị mới
        this.config[key] = value;
    
        try {
            // Chuyển đối tượng config thành chuỗi JSON
            const configString = JSON.stringify(this.config);
    
            // Lưu chuỗi JSON vào localStorage
            localStorage.setItem(PLAYER_STORAGE_KEY, configString);
        } catch (error) {
            // Xử lý lỗi khi chuyển đổi thành JSON hoặc lưu vào localStorage
            console.error('Lỗi khi lưu cấu hình vào localStorage:', error);
        }
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background: url(${song.image}) no-repeat center / cover;">
                        
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

       playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function(event) {
        //Lấy ra kích thước chiều cao và ngang
        const cdWidth = cd.offsetWidth;
        const cdHeight = cd.offsetHeight;

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg'}
        ], {
            duration: 10000,
            iterations: Infinity,//Lặp vô hạn
        })
        cdThumbAnimate.pause();

        //Xử lý phóng to thu nhỏ cd
        document.onscroll = function() {//Lắng nghe sự kiện scroll của cả trang web
            const scrollTop = window.scrollY || document.documentElement.scrollTop;//1 số trình duyệt chỉ sử dụng được 1 trong 2 thằng
            const newCdWidth = cdWidth - scrollTop;
            const newCdHeight = cdHeight - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.height = newCdHeight > 0 ? newCdHeight + 'px': 0;

            cd.style.opacity = newCdWidth / cdWidth;//Mờ dần
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }

            audio.onplay = function() {
                iconPlay.classList.replace('fa-play', 'fa-pause');
                cdThumbAnimate.play();
            }

            audio.onpause = function() {
                iconPlay.classList.replace('fa-pause', 'fa-play');
                cdThumbAnimate.pause();
            }
        }
        //Khi tiến độ bài hát thay đổi
        //audio.duration Là tổng thời lượng bài hát
        //audio.currentTime là time hiện tại của bài hát hoặc có thể gán cho nó giá trị mới

        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        }


        //Xử lý khi tua
        progress.oninput = function() {
            const seekTime = (this.value * audio.duration / 100);
            audio.currentTime = seekTime;
        }

        //Khi next bài hát
        nextBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            audio.play();
            app.render();//Khi bài next thì sẽ render lại
            app.scrollToActiveSong();
        }

        prevBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            } else {
                app.prevSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }


        //Xử lý random bật tắt
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        }

        //Xử lý khi repeat
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle('active', app.isRepeat);

        }

        //Xử lý next song khi audio ended
        audio.onended = function() {
            // if(app.isRandom) {
            //     app.playRandomSong();
            // } else {
            //     app.nextSong();
            // }
            // audio.play();

            //hoặc làm như này
            if(app.isRepeat) {
                audio.play();//Khi repeat bật thì sẽ phát lại bài hát
            } else {    
                nextBtn.click();
            }
        }

        //Lắng nghe click vào playlist
        playlist.onclick = function(e) {
            if(e.target.closest('.song:not(.active)') || e.target.closest('.option')) {//Kiểm tra xem mình có click vào thằng song mà không cso active không
                //Xử lý khi click vào song
                if(e.target.closest('.song:not(.active)')) {
                   let songNode = e.target.closest('.song:not(.active)');
                    app.currentIndex = Number(songNode.dataset.index);//Khi get data-index thì nó là chuỗi phải chuyển sang number
                    app.loadCurrentSong();
                    audio.play();
                    app.render();
                }

                //Xử lý khi click vào option
                if(e.target.closest('.option')) {
                    
                }

                
            }
        }
    },

    scrollToActiveSong: function() {//Xử lý khi chạy 1 bài hát nó phải hiện thị lên vị trí mà người dùng nhìn thấy
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'center',
            })
        }, 100);
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },


    loadCurrentSong: function (){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();//Tức là khi sang bài mới thì nó sẽ load(tải thông tin mới lên);
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig();


        //Định nghĩa các thuộc tính cho object
        this.defineProperties()

        //Lắng nghe các sự kiện
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI
        this.loadCurrentSong()

        //Hiển thị danh sách bài hát
        this.render()

        //Hiển thị trạng thái ban đầu của btn repeat and random
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);
    },
}

app.start();//Tức là chỉ cần start thì thằng render sẽ được thực hiện
