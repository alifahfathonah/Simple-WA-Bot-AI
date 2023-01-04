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
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey:"",//isi sesuai API key pribadi
});
const openai = new OpenAIApi(configuration);

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
        }
    })


    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        
        
        if(!messages[0].key.fromMe) {
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

            }else if(!messages[0].key.fromMe && pesanMasuk.includes("lagi")){
                var things = ['Lagi mencoba jadi goblok','Lagi sok asik','lagi anu', 'apa lagi si', 'lagi pengen seblac', 'lagi mikirin selain kamu']
                var thing = things[Math.floor(Math.random()*things.length)];
                await sock.sendMessage(id, {text: thing},{quoted: messages[0] });

            }else if(!messages[0].key.fromMe && pesanMasuk.includes("love")){
                var things = ['Love me too', 'ayam sorry', 'kasi tau ga ya', 'Love you more' , 'not love love an', 'love monyet kali', 'yak dikit lagi lucu yok']
                var thing = things[Math.floor(Math.random()*things.length)];
                await sock.sendMessage(id, {text: thing},{quoted: messages[0] });
            
            }else{

                try {
                    const completion = await openai.createCompletion({
                        model: "text-davinci-003",
                        prompt: pesanMasuk,
                        max_tokens: 3000,
                        temperature: 0,
                        top_p: 1.0,
                        frequency_penalty: 0.0,
                        presence_penalty: 0.0,
                    });
                    // console.log(completion.data.choices[0].text);
                    const chatResult = completion.data.choices[0].text;
                    const modifiedResult = chatResult.replace(/\n\n/g, "\n").replace(/\n\n\n/g, "").replace(/\n/, "");;
                    await sock.sendMessage(id, {text: modifiedResult },{quoted: messages[0] });
                  } catch (error) {
                    if (error.response) {
                      console.log(error.response.status);
                      console.log(error.response.data);
                    } else {
                      console.log(error.message);
                    }
                  }

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

