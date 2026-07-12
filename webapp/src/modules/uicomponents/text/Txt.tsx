import {Txt_Body} from "@modules/uicomponents/text/Txt.Body.tsx";
import {Txt_Heading} from "@modules/uicomponents/text/Txt.Heading.tsx";
import {Txt_Icon} from "@modules/uicomponents/text/Txt.Icon.tsx";
import {Txt_Line} from "@modules/uicomponents/text/Txt.Line.tsx";
import {Txt_Number} from "@modules/uicomponents/text/Txt.Number.tsx";
import {Txt_String} from "@modules/uicomponents/text/Txt.String.tsx";
import {Txt_Clickable} from "@modules/uicomponents/text/Txt.Clickable.tsx";

export const Txt = {
    Heading: Txt_Heading,
    Line: Txt_Line,
    Body: Txt_Body,

    Icon: Txt_Icon,
    Number: Txt_Number,
    String: Txt_String,

    Clickable: Txt_Clickable,
}



/*

Heading, Line and Body server as "Containers for text" and take Icon, Number, String, Clickable as child elements.
Children in these containers are arranged as a continous "text"


CONTAINERS:

Heading:
    - the contained text is a heading of a specified level
    - may add line breaks

Line
    - the contained text is normal text
    - may not add line breaks, only a single line of text
    - cuts off overflow of line is not wide enough

Body
    - the contained text is normal text
    - add line breaks of the text does not fit



CONTENT:

String
    - normal text from js strings
    - nothing special, no extra highlights or features

Number
    - formats a number
    - specify number decimal points
    - whether to show as a percentage value
    - whether to force/show a +/- sign
    - may color it red,green depending on value

Icon
    - inlines a svg icon



SPECIAL:

Clickable
    - always a child of a txt container
    - takes String, Number or Icon element as children (same as container) and inlines them
    - adds an underline to text and changes cursor to a pointer
    - calls a function when user clicks on content

*/