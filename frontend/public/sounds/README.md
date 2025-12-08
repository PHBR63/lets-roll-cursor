# 🎵 Arquivos de Áudio - Sistema de Insanidade

Este diretório contém os arquivos de áudio usados para efeitos sonoros de insanidade.

## 📁 Arquivos Necessários

### Efeitos de Insanidade

1. **`insanity-low.mp3`** (Perturbado - SAN ≤ 50%)
   - Descrição: Som de tensão sutil, ambiente inquietante
   - Duração: 10-15 segundos (loop)
   - Volume sugerido: 30-40%
   - Características:
     - Sussurros distantes
     - Ruído estático leve
     - Tom baixo e ameaçador
     - Frequências graves

2. **`insanity-medium.mp3`** (Enlouquecendo - SAN ≤ 25%)
   - Descrição: Som de alerta, tensão crescente
   - Duração: 15-20 segundos (loop)
   - Volume sugerido: 40-50%
   - Características:
     - Batidas cardíacas aceleradas
     - Vozes distorcidas
     - Ruído estático moderado
     - Frequências médias e graves

3. **`insanity-critical.mp3`** (Totalmente Insano - SAN = 0)
   - Descrição: Som crítico, atmosfera de horror
   - Duração: 20-30 segundos (loop)
   - Volume sugerido: 50-60%
   - Características:
     - Gritos distantes
     - Ruído estático intenso
     - Distorção severa
     - Frequências graves e agudas
     - Sensação de caos

## 🎨 Sugestões de Criação

### Ferramentas Recomendadas

- **Audacity** (gratuito): https://www.audacityteam.org/
- **Freesound.org**: Biblioteca de sons gratuitos
- **Zapsplat**: Biblioteca de efeitos sonoros
- **Adobe Audition**: Software profissional

### Fontes de Áudio Livres

1. **Freesound.org**
   - Buscar: "horror ambience", "tension", "static noise"
   - Licença: CC0 ou CC BY (verificar licença)

2. **Zapsplat**
   - Categoria: Horror / Tension
   - Licença: Gratuita com atribuição

3. **YouTube Audio Library**
   - Categoria: Horror / Dark Ambient
   - Licença: Livre de direitos

### Processamento de Áudio

Para criar os efeitos:

1. **insanity-low.mp3**:
   - Base: Ambiente sutil com sussurros
   - Efeitos: Reverb leve, filtro passa-baixa
   - Normalizar para -12dB

2. **insanity-medium.mp3**:
   - Base: Batidas cardíacas + ruído estático
   - Efeitos: Distorção leve, compressão
   - Normalizar para -10dB

3. **insanity-critical.mp3**:
   - Base: Caos sonoro + gritos distantes
   - Efeitos: Distorção severa, reverb longo, filtros
   - Normalizar para -8dB

## 📝 Formato dos Arquivos

- **Formato**: MP3 (compatibilidade máxima)
- **Bitrate**: 128-192 kbps (balance entre qualidade e tamanho)
- **Sample Rate**: 44.1 kHz
- **Canais**: Estéreo (2.0)
- **Duração**: Variável (será usado em loop)

## 🔄 Fallback

Se os arquivos não estiverem disponíveis, o sistema:
- Não reproduzirá sons (comportamento silencioso)
- Logará avisos no console (apenas em desenvolvimento)
- Continuará funcionando normalmente

## ✅ Checklist de Implementação

- [ ] Criar/obter `insanity-low.mp3`
- [ ] Criar/obter `insanity-medium.mp3`
- [ ] Criar/obter `insanity-critical.mp3`
- [ ] Testar reprodução em diferentes navegadores
- [ ] Verificar volume e balanceamento
- [ ] Testar com preferências de acessibilidade
- [ ] Otimizar tamanho dos arquivos

## 🎚️ Configuração de Volume

Os volumes são configuráveis via:
- Hook `useInsanitySound` (parâmetro `volume`, padrão: 0.3)
- Configurações de acessibilidade (usuário pode desabilitar)
- Preferências do navegador (autoplay policy)

## 📖 Uso no Código

Os arquivos são referenciados em:
- `frontend/src/hooks/useInsanitySound.ts`
- Caminho: `/sounds/insanity-{level}.mp3`

## ⚠️ Nota Legal

Certifique-se de que todos os arquivos de áudio usados:
- Tenham licença apropriada (CC0, CC BY, ou similar)
- Sejam atribuídos corretamente se necessário
- Não violem direitos autorais

