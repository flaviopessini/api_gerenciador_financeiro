# api_gerenciador_financeiro
API desenvolvida no curso de "API REST em Node.JS aplicando testes (TDD) desde o princípio"

### Iniciar e manter serviço rodando
Instalar dependência global
```
npm install -g pm2
```

Após executar o comando abaixo, o terminal pode ser encerrado sem que o serviço seja interrompido
```
pm2 start npm -- start
```

Para verificar os processos em execução
```
pm2 status
```

Para encerrar um processo em execução
```
pm2 stop 'id'
```
