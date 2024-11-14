import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/Context';
import { loginUser, validarToken } from '../../api/user';
import { toast } from 'react-toastify';
import './styles.css';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isVerifyEmail, setIsVerifyEmail] = useState(false);
    const [emailToken, setEmailToken] = useState('');
    const [token, setToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 600 seconds = 10 minutes

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !senha) {
            return toast('Informe o e-mail e a senha para continuar!');
        }

        try {
            const response = await loginUser(email, senha);
            if (response.data.token) {
                setToken(response.data.token);
                setIsVerifyEmail(true);
            }
        } catch (error) {
            return toast(error.response.data.error);
        }
    };

    const handleSubmitToken = async (e) => {
        e.preventDefault();

        if (!token) {
            return toast('Informe o token para continuar!');
        }

        try {
            const response = await validarToken(emailToken);
            if (response.status === 200) {
                login(token);
                return navigate('/');
            }
        } catch (error) {
            toast(error.response.data.error);
        }
    };

    useEffect(() => {
        if (isVerifyEmail) {
            // Inicia o contador quando isVerifyEmail for true
            const interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        setIsVerifyEmail(false); // Reseta o estado quando o tempo acaba
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
        }
    }, [isVerifyEmail]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className='container'>
            <h1>Login</h1>
            {!isVerifyEmail ? (
                <form>
                    <div className='div-input'>
                        <label>Email:</label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='div-input'>
                        <label>Senha:</label>
                        <input
                            type='password'
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>
                    <Link to='/register'>Não tem cadastro? Cadastre-se aqui</Link>
                    <button type='submit' onClick={handleSubmit}>Entrar</button>
                </form>
            ) : (
                <form>
                    <h1>Digite o Token de Verificação</h1>
                    <div className="div-input">
                        <input
                            type='text'
                            value={emailToken}
                            onChange={(e) => setEmailToken(e.target.value)}
                        />
                        <button type='submit' onClick={handleSubmitToken}>Validar token</button>
                        <button onClick={setIsVerifyEmail}>Voltar</button>
                    </div>
                    <p>O token expira em: {formatTime(timeLeft)}</p>
                </form>
            )}
        </div>
    );
}
