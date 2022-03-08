var express = require('express'); // requisita a biblioteca para a criacao dos serviços web.
 var pg = require("pg"); // requisita a biblioteca pg para a comunicacao com o banco de dados.

 var sw = express(); // iniciliaza uma variavel chamada app que possitilitará a criação dos serviços e rotas.

 sw.use(express.json());//padrao de mensagens em json.

 sw.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    next();
});

const config = {
    host: 'localhost',
    user: 'postgres',
    database: 'db_cs_lpbd_2021_2',
    password: '123456',
    port: 5432
};

//definia conexao com o banco de dados.
const postgres = new pg.Pool(config);

//definicao do primeiro serviço web.
sw.get('/', (req, res) => {
    res.send('Hello, world! meu primeiro teste.  #####');
})

sw.get('/listjogador', function (req, res) {

    //estabelece uma conexao com o bd.
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select j.nickname, j.senha, j.quantpontos, j.quantdinheiro, to_char(j.datacadastro, \'yyyy/mm/dd\') as datacadastro, to_char(j.data_ultimo_login, \'yyyy/mm/dd\') as data_ultimo_login, j.situacao, e.cep, e.complemento, e.codigo from tb_jogador j left join tb_endereco e on (j.nickname=e.nicknamejogador) order by j.datacadastro asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});





sw.get('/listmodo', function (req, res) {

    //estabelece uma conexao com o bd.
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select nome, codigo, to_char(datacriacao, \'yyyy-mm-dd\') as datacriacao, quantboots, quantrounds from tb_modo order by datacriacao asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});
//criar o servico web, no modo get, para listar os registro da tabela tb_local - feito.

//criar o servico web, no modo get, para criar registro da tabela tb_local

//criar o servico web, no modo get, para alterar registro da tabela tb_local


sw.post('/insertmodo', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q ={
                //insert into tb_modo (nome, datacriacao, quantboots, quantrounds) values ('teste', now(), 8, 20);
                text: 'insert into tb_modo (nome, datacriacao, quantboots, quantrounds) values ($1, now(), $2,  $3 ) returning codigo',
                values: [req.body.nome, req.body.quantboots, req.body.quantrounds]
            }
            console.log(q);
    
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 no insert');
                    console.log(err);
                    console.log(err.data);
                    res.status(400).send('{'+err+'}');
                }else{

                    console.log('retornou 201 no insert');
                    res.status(201).send(result.rows[0]);//se não realizar o send nao finaliza o client
                }           
            });
       }       
    });
});

sw.get('/deletemodo/:codigo', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados"+ err);
            res.status(400).send('{'+err+'}');
        }else{
            
            var q ={
                text: 'delete FROM tb_modo where codigo = $1',
                values: [req.params.codigo]
            }
    
            client.query( q , function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send({'codigo': req.params.codigo});//retorna o nickname deletado.
                }

            });
        } 
     });
});

sw.post('/updatemodo/', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){

            console.log("Não conseguiu acessar o BD: "+ err);
            res.status(400).send('{'+err+'}');

        }else{

            var q ={
                //update tb_modo set nome = '', quantboots = 0, quantrounds = 0 where codigo = 1;
                text: 'update tb_modo set nome = $1, quantboots = $2, quantrounds = $3 where codigo = $4',
                values: [req.body.nome, req.body.quantboots, req.body.quantrounds, req.body.codigo]
            }
            console.log(q);
     
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log("Erro no update modo: "+err);
                    res.status(400).send('{'+err+'}');
                }else{             
                    res.status(200).send(req.body);//se não realizar o send nao finaliza o client nao finaliza
                }
            });
        }
     });
});

sw.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});