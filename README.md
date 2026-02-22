# Spatial Visualizer

Prototype d'application de visualisation 3D des objets d'un flux audio spatialisé.

## Principe

- Le serveur écoute des messages OSC en UDP (port `9000` par défaut).
- Au démarrage, le viewer envoie `/truehdd/register [listen_port]` vers `<host>:9000` (port configurable via `--osc-rx-port`) pour s’enregistrer auprès de truehdd.
- Les positions reçues sont diffusées en WebSocket au front web.
- Le front affiche chaque source comme une sphère dans un volume 3D normalisé `[-1, 1]`.
- Le menu **Layout** permet de choisir la configuration d’enceintes chargée depuis `layouts/*.json` et affichée dans la scène.

## Formats OSC supportés

Le serveur accepte le format historique du prototype **et** des variantes de type bridge (id embarqué dans l'adresse, coordonnées sphériques).

### 1) Position cartésienne (format historique)

```text
/source/position id x y z
```

### 2) Position cartésienne (id dans l'adresse)

```text
/source/<id>/position x y z
/object/<id>/position x y z
/channel/<id>/position x y z
```

### 3) Position sphérique (azimut, élévation, distance)

```text
/source/<id>/aed azimuth elevation distance
```

> Le serveur convertit `aed` vers `x y z`, puis clamp dans `[-1,1]`.

### 4) Suppression d'une source

```text
/source/remove id
/source/<id>/remove
```


## Options CLI

```bash
node server.js --host 127.0.0.1 --osc-port 9000 --osc-rx-port 9000 --http-port 3000
```

- `--osc-port` : port UDP local d'écoute OSC (utilisé aussi comme `listen_port` dans `/truehdd/register`).
- `--host` / `--osc-host` : hôte truehdd cible pour l'enregistrement.
- `--osc-rx-port` : port UDP côté truehdd recevant `/truehdd/register` (défaut `9000`).
- `--http-port` : port HTTP du viewer.

## Lancer le projet

```bash
npm install
npm start
```

Puis ouvrir: [http://localhost:3000](http://localhost:3000)

## Vérification rapide

```bash
node --test
```
