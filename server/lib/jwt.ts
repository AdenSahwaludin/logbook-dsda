import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'adensahwaludinjasbdsnjxewhongfpewiugrxnpugwaexpxreuawngpanwuevgrbwpeucqpeqgcpegxntmazyzmxzbgnremlhgxbpaecbnamgxrybmoeruaygxyegruhbfnsjkdaiuhfeirwrwresddsddssdsnnmssfbjhergrehgihwdbniguvhugerhunoiaheieiiwerhi'

export interface JwtPayload {
  id: string
  username: string
  role: 'admin' | 'user'
  name: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (err) {
    return null
  }
}
