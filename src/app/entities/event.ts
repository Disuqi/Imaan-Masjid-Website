export class Event {
    public id: number;
    public title: string;
    public description?: string;
    public date?: Date;
    public image?: string;
    public imageUrl? : string;

    public constructor(title: string, description: string = null, date: Date = null, image: string = null)
    {
        this.title = title;
        this.description = description;
        this.date = date;
        this.image = image;
    }
}