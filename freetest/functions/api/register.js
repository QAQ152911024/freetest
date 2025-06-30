export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/index') {
      const { username, password } = await request.json();
      const { results } = await env.free.prepare(
        'SELECT * FROM free WHERE username = ? AND password = ?'
      ).bind(username, password).all();
      if (results.length > 0) {
        return Response.json({ success: true });
      } else {
        return Response.json({ success: false, message: '用户名或密码错误' });
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/register') {
      const { username, password, phone } = await request.json();
      // 检查用户名是否已存在
      const { results } = await env.free.prepare(
        'SELECT * FROM free WHERE username = ?'
      ).bind(username).all();
      if (results.length > 0) {
        return Response.json({ success: false, message: '用户名已存在' });
      }
      // 插入新用户
      await env.free.prepare(
        'INSERT INTO free (username, password, phone) VALUES (?, ?, ?)'
      ).bind(username, password, phone).run();
      return Response.json({ success: true, message: '注册成功' });
    }

    // 其他请求返回404
    return new Response('Not found', { status: 404 });
  }
}