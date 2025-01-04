// 1.
// serverdan -> clien'a gonderirken io.emit() -> tum client'a gonderir.
// serverdan -> client'a gonderirken socket.emit() -> belirli client'a gonderir.
// serverdan -> client'a gonderirken socket.broadcast.emit() -> belirli client haric tum client'a gonderir.

// 2.
// client'dan -> server'a gonderirken socket.emit() -> server'a gonderir.

// bir clientten tum clientlara mesaj gondermek icin;
// clientte socket.emit() kullaniriz.
// serverde socket.on() kullanarak mesaji dinleriz.
// daha sonra serverde io.emit() kullanarak mesaji tum client'lara gondeririz.
