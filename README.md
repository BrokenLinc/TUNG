# [TUNG]

A game prototype using Canvas and SVG.

# [Tarmac]

Canvas-based game library.

*Methods*
* clear_canvas()
* draw_resource(resource:object, spritePos:object)
* keysDown(char:string)

*Properties*
background: [color?]
canvas: [HTMLdomElement]
mat: [Transform?]

*Resource*
* key: [string, required] - an indentifier
* path: [string, required] - path to an SVG file
* spriteMap: [object, optional] - how to divide up the file into a grid
** x: [int, required] - number of columns
** y: [int, required] - number of rows

*Sprite animation*
* key: [string, required] - an indentifier
* d: [number, optional/recommended] - default frame duration for animation
* keyframes: [array, required] - a sequence of frames
** x: [int, optional] - next column to move to
** y: [int, optional] - next row to move to
** d: [int, optional] - duration of frame

*Game* (GameEntity)

*Scene* (GameEntity)
Takes up whole canvas area and stays centered.

*GameEntity*

Properties
* x: [int]
* y: [int]
* resource: [string] - a reference to a resource identifier
* rotation: [int] - in degrees
* scale: [int]
* isMirrored: [bool] - horizontal flip
* isFlipped: [bool] - vertical flip
* visible: [bool]
* entities: [array] - collection of game entities

Methods
* addEntity(e:gameEntity)
* removeEntity(e:gameEntity)
* remove()
* add_transform(transform:object, target:gameEntity)
* remove_transform(transform:object, target:gameEntity)
* init()
* initChildren()
* process()
* processChildren()
* update()
* updateChildren()

A helper method to check if keys are down, by character

*Sprite* (GameEntity)

Properties
* frame: [object]
** x: [int]
** y: [int]

Methods
* adjust()
* draw()
* play(animationKey:string, repeat:int, complete:function)
* playOnce(animationKey:string, complete:function)
* stop()

*ResourceManager*
A singleton object to manage resources.

Properties
* container: [string] - an HTML selector to inject SVG resources into

Methods
* load(sources:array, complete:function)
* byKey(key:string)

*SpriteAnimationManager*
A singleton object to manage sprite animations.

Methods
* load(sources:array, complete:function)
* byKey(key:string)

*Tarmac.Shapes*
A helper namespace containing common shapes

Methods
* Circle (GameEntity)


