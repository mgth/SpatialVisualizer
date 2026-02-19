# Spatial Visualizer

Prototype d'application de visualisation 3D des objets d'un flux audio spatialisé.

## Principe

- Le serveur écoute des messages OSC en UDP (port `9000` par défaut).
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
