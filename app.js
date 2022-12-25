const {
    default: makeWASocket,
	DisconnectReason,
    useSingleFileAuthState
} =require("@adiwajshing/baileys");

const {state, saveState} = useSingleFileAuthState("./auth_info.json");
const { Boom } =require("@hapi/boom");
const app = require("express")();
const server = require("http").createServer(app);
const port = process.env.PORT || 8008;


async function connectToWhatsApp () {
    const sock = makeWASocket({
        // can provide additional config here
        auth: state,
        printQRInTerminal: true
    })
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
            // const monitor = "628869583018"
            // sock.sendMessage(monitor+'@s.whatsapp.net', {text: "I'm allive"});
        }
    })


    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        
        
        if(!messages[0].key.fromMe) {
            // const id = '6288129930000@s.whatsapp.net';
            const id = messages[0].key.remoteJid;
            const pesan = messages[0].message.conversation;
            const pesanMasuk = pesan.toLowerCase();

            const weekday = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
            const d = new Date();
            let day = weekday[d.getDay()];

            await sock.readMessages([messages[0].key]);

            if(!messages[0].key.fromMe && pesanMasuk === "hi"){
                await sock.sendMessage(id, {text: "Hello"},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk === "hari"){
                await sock.sendMessage(id, {text: day},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk === "q"){
                await sock.sendMessage(id, {text: "qwerty"},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk === "a"){
                await sock.sendMessage(id, {text: "asdfg"},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk === "create"){
                await sock.sendMessage(id, {text: "System akan mulai membuat harimu jadi suram"},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk === "read"){
                await sock.sendMessage(id, {text: "System sedang membaca pikiran kotormu"},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk === "update"){
                await sock.sendMessage(id, {text: "System mendeteksi kamu update sosmed tapi hanya konten flexing yang membagongkan"},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk === "delete"){
            await sock.sendMessage(id, {text: "Sistem memcoba menghapus kemalasanmu tapi gagal"},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk.includes("lagi")){
                var things = ['Lagi mencoba jadi goblok','Lagi sok asik','lagi anu', 'apa lagi si', 'lagi pengen seblac', 'lagi mikirin selain kamu']
                var thing = things[Math.floor(Math.random()*things.length)];
                await sock.sendMessage(id, {text: thing},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk.includes("love")){
                var things = ['Love me too', 'ayam sorry', 'kasi tau ga ya', 'Love you more' , 'not love love an', 'love monyet kali', 'yak dikit lagi lucu yok']
                var thing = things[Math.floor(Math.random()*things.length)];
                await sock.sendMessage(id, {text: thing},{quoted: messages[0] });
            
            }else{
                var things = [ 'cerewet anda', 'xixixi lucu bangettt', 'Si paling jago, emang', 'NT kadang kadang NT', 'hahahah f', 'unch unch dan unyu', 'makan lah sikit nanti sakit', 'makan lah sikit nanti mati', 'gombalin aqu dong', 'ah masaaa', 'ayam ayam apa yang..', 'iyaa seyenk', 'ditinggal pas sayang sayange', 'afa iyah', 'haa ga denger..', 'bek bek bek'];
                var thing = things[Math.floor(Math.random()*things.length)];
                await sock.sendMessage(id, {text: thing},{quoted: messages[0] });
            }
        }

    })
}
// run in main file
connectToWhatsApp()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors

server.listen(port, () => {
  console.log("Server Live On Port : " + port);
});

