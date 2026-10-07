from PIL import Image, ImageDraw
from pathlib import Path
base=Path(__file__).resolve().parents[1]/'public'
for size,name in [(192,'icon-192.png'),(512,'icon-512.png'),(512,'icon-maskable.png'),(180,'apple-touch-icon.png')]:
 im=Image.new('RGB',(size,size),'#32686c');d=ImageDraw.Draw(im)
 for x,h in [(0.30,.16),(.40,.32),(.50,.46),(.60,.32),(.70,.16)]:
  width=round(size*.048);left=round(size*x-width/2);top=round(size*(.5-h/2))
  d.rounded_rectangle((left,top,left+width,round(size*(.5+h/2))),radius=width/2,fill='#f8f5e9')
 im.save(base/name)
