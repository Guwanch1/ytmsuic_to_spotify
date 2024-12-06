from ytmusicapi import YTMusic
import json
ytmusic = YTMusic()

playlist_id = input()

res = ytmusic.get_playlist(playlist_id)

yt_tracks = []

for track in res['tracks']:
	print(track['artists'][0]['name'])
	print(track['title'])
	yt_tracks.append({'title':track['title'], 'artist': track['artists'][0]['name']})

with open('yt_tracks.json', 'w') as f:
	json.dump(yt_tracks, f)