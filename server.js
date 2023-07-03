var express = require('express');
var bodyparser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
const app = express();

app.use(bodyparser.json());
const {json} = require('body-parser');
const http = require('http');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'booking_cuci_mobil'
});

conn.connect(function (err){
    if (err) throw err;
    console.log("MySQL connected.....");
});

//loginadmin
app.post('/loginadmin', function(req, res) {
    console.log("POST request /loginadmin");
    let username = {user: req.body.username};
    json.getString

    console.log("POST request data ="+JSON.stringify(username.user));
    
    let password = {pass: req.body.password};
    console.log("POST request data ="+JSON.stringify(password.pass));
    let sql = "SELECT Nama,id FROM admin WHERE Nama='"+username.user+"' AND password = '"+password.pass+"'";
    console.log(sql)
    let query = conn.query(sql, (err, result) => {
        console.log(JSON.stringify(
            {"status" : 200, "error" : null, "response" : result}
        ));
        if(result != "") {
           // res.send(result)
            res.send("Login Berhasil")
        }
        else {
            res.send("Login Gagal")}
    });
});

//Register User
app.post('/register', function(req, res) {
    console.log('POST request /register');
    let requestBody = req.body;
    console.log("BODY:", requestBody);

    // Mengecek apakah username sudah terdaftar sebelumnya
    conn.query('SELECT * FROM register WHERE username = ?',
        [requestBody.username],
        function(error, results, fields) {
            if (error) {
                console.log("Error:", error);
                res.status(200).json({ isRegisterSuccess: false, error: error, message: `Registrasi gagal` });
            } else {
                if (results.length > 0) {
                    // Username sudah terdaftar
                    console.log("Username sudah terdaftar");
                    res.status(200).json({ isRegisterSuccess: false, error: null, message: `Username sudah terdaftar` });
                } else {
                    // Menyimpan data ke database
                    conn.query('INSERT INTO register (username, password, jenis_mobil) VALUES (?, ?, ?)',
                        [requestBody.username, requestBody.password, requestBody.jenis_mobil],
                        function(error, results, fields) {
                            if (error) {
                                console.log("Error:", error);
                                res.status(200).json({ isRegisterSuccess: false, error: error, message: `Registrasi gagal` });
                            } else {
                                console.log("Data berhasil disimpan");
                                res.status(200).json({ isRegisterSuccess: true, error: null, message: `Registrasi Sukses` });
                            }
                        }
                    );
                }
            }
        }
    );
});

//logincustomer
app.post('/logincustomer', function(req, res) {
    console.log('POST request /logincustomer');
    let requestBody = req.body;
    console.log("BODY:", requestBody);

    // Mengecek apakah username sudah terdaftar
    conn.query('SELECT * FROM register WHERE username = ?',
        [requestBody.username],
        function(error, results, fields) {
            if (error) {
                console.log("Error:", error);
                res.status(200).json({ username_ada: false, error: error, message: `Terjadi kesalahan saat memeriksa username` });
            } else {
                if (results.length > 0) {
                    // Username sudah terdaftar
                    console.log("Username sudah terdaftar");
                    res.status(200).json({ username_ada: true, error: null, message: `Username sudah terdaftar` });
                } else {
                    // Username belum terdaftar
                    console.log("Username belum terdaftar");
                    res.status(200).json({ username_ada: false, error: null, message: `Username belum terdaftar` });
                }
            }
        }
    );
});

//booking
app.post('/booking', function(req, res) {
    console.log('POST request /booking');
    let requestBody = req.body;
    console.log("BODY:", requestBody);

    // Mengecek apakah waktu sudah dibooking
    conn.query('SELECT * FROM booking WHERE waktu = ?',
        [requestBody.waktu],
        function(error, results, fields) {
            if (error) {
                console.log("Error:", error);
                res.status(200).json({ bisa_booking: false, error: error, message: `Terjadi kesalahan saat memeriksa waktu booking` });
            } else {
                if (results.length > 0) {
                    // Waktu sudah dibooking
                    console.log("Waktu sudah dibooking");
                    res.status(200).json({ bisa_booking: false, error: null, message: `Waktu sudah dibooking` });
                } else {
                    // Booking bisa dilakukan, simpan data ke tabel
                    conn.query('INSERT INTO booking (tanggal, waktu, username, jenis_mobil, jenis_layanan, lokasi) VALUES (?, ?, ?, ?, ?, ?)',
                        [requestBody.tanggal, requestBody.waktu, requestBody.username, requestBody.jenis_mobil, requestBody.jenis_layanan, requestBody.lokasi],
                        function(error, results, fields) {
                            if (error) {
                                console.log("Error:", error);
                                res.status(200).json({ bisa_booking: false, error: error, message: `Terjadi kesalahan saat menyimpan data booking` });
                            } else {
                                console.log("Data booking berhasil disimpan");
                                res.status(200).json({ bisa_booking: true, error: null, message: `Booking berhasil dilakukan` });
                            }
                        }
                    );
                }
            }
        }
    );
});

//cancel booking
app.post('/cancelbooking', function(req, res) {
    console.log('POST request /cancelbooking');
    let requestBody = req.body;
    console.log("BODY:", requestBody);

    // Mengecek apakah booking bisa dicancel
    conn.query('SELECT * FROM booking WHERE waktu = ? AND username = ?',
        [requestBody.waktu, requestBody.username],
        function(error, results, fields) {
            if (error) {
                console.log("Error:", error);
                res.status(200).json({ bisa_cancelbooking: false, error: error, message: `Terjadi kesalahan saat memeriksa cancel booking` });
            } else {
                if (results.length > 0) {
                    // Booking bisa dicancel, hapus data dari tabel
                    conn.query('DELETE FROM booking WHERE waktu = ? AND username = ?',
                        [requestBody.waktu, requestBody.username],
                        function(error, results, fields) {
                            if (error) {
                                console.log("Error:", error);
                                res.status(200).json({ bisa_cancelbooking: false, error: error, message: `Terjadi kesalahan saat membatalkan booking` });
                            } else {
                                console.log("Booking berhasil dibatalkan");
                                res.status(200).json({ bisa_cancelbooking: true, error: null, message: `Booking berhasil dibatalkan` });
                            }
                        }
                    );
                } else {
                    // Booking tidak bisa dicancel
                    console.log("Cancel Booking tidak bisa dilakukan");
                    res.status(200).json({ bisa_cancelbooking: false, error: null, message: `Cancel Booking tidak bisa dilakukan` });
                }
            }
        }
    );
});

//list customer
app.post('/listcustomer', function(req, res) {
    console.log('POST request /listcustomer');
    let requestBody = req.body;
    console.log("BODY:", requestBody);

    // Menyimpan data ke database
    conn.query('INSERT INTO list_customer (username, jenis_mobil, jenis_layanan, lokasi) VALUES (?, ?, ?, ?)',
        [requestBody.username, requestBody.jenis_mobil, requestBody.jenis_layanan, requestBody.lokasi],
        function(error, results, fields) {
            if (error) {
                console.log("Error:", error);
                res.status(200).json({ isListCustomerSuccess: false, error: error, message: `Gagal menyimpan data list customer` });
            } else {
                console.log("Data list customer berhasil disimpan");
                res.status(200).json({ isListCustomerSuccess: true, error: null, message: `Data list customer berhasil disimpan` });
            }
        }
    );
});

//trek record
app.post('/trackrecord', function(req, res) {
    console.log('POST request /trackrecord');
    let requestBody = req.body;
    console.log("BODY:", requestBody);

    // Menyimpan data ke database
    conn.query('INSERT INTO trekrecord (hari, waktu, jenis_layanan, history_kunjungan) VALUES (?, ?, ?, ?)',
        [requestBody.hari, requestBody.waktu, requestBody.jenis_layanan, requestBody.history_kunjungan],
        function(error, results, fields) {
            if (error) {
                console.log("Error:", error);
                res.status(200).json({ isTrackRecordSuccess: false, error: error, message: `Gagal menyimpan data track record` });
            } else {
                console.log("Data track record berhasil disimpan");
                res.status(200).json({ isTrackRecordSuccess: true, error: null, message: `Data track record berhasil disimpan` });
            }
        }
    );
});

var server = app.listen(7000,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Express app listening at http://%s:%s", host,port);
})