
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const errHandle = require('./errorHandle');
const headers = require('./headers');

const todos = [];

const requestListener = (req, res) => {
  let body = '';
  // 累加傳輸中的檔案
  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === '/todos' && req.method === 'GET') {
    
    res.writeHead(200, headers);
    // 把 JS 的物件轉成 JSON 格式的字串，網路才能解析
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      })
    );
    res.end();
  } else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            title,
            id: uuidv4(),
          };
          todos.push(todo);

          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: 'success',
              data: todos,
            })
          );
          res.end();
        } else {
          errHandle(res);
        }
      } catch (error) {
        errHandle(res);
      }
    });
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    // DELETE 或 POST 方法，我們不會接收 body 資料，所以不用寫 req.on('end',....)
    // 快速清空陣列的方法：長度給它 0
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      })
    );
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    // 抓出 url 的 uuid
    const id = req.url.split('/').pop();
    const index = todos.findIndex(el => el.id === id);

		// 判斷有沒有值，有值才做刪除
    if(index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: 'success',
          data: todos,
        })
      );
      res.end();
    } else {
      errHandle(res);
    }

  }else if (req.method === 'OPTIONS') {
    // 可以使用 OPTIONS 發請求，測試伺服器支持哪些 HTTP 方法
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '無此網站路由',
      })
    );

    res.end();
  }
};

const server = http.createServer(requestListener);

// heroku 不認得 3005，第一個表達式會指向 heroku 自己的環境變數
server.listen(process.env.PORT || 3005);