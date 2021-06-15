import { rest } from 'msw';

export const handlers = [
  rest.post('http://localhost:8000/api/v1/token-auth/', (req, res, ctx) => {
    return res(
      ctx.json({token: "testToken"})
    )
  }),

  rest.get('http://localhost:8000/api/v1/auth/user/', (req, res, ctx) => {
    return res(
      ctx.json({
          username: 'testUser',
          first_name: 'FTest',
          last_name: 'LTest',
          email: 'test@test.test'
        })
    );
  }),

  rest.get('http://localhost:8000/api/v1/incidents/metadata/', (req, res, ctx) => {
    return res(ctx.json([]));
  }),
];