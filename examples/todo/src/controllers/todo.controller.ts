// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody, Response, RestBindings
} from '@loopback/rest';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';
import {GeocoderService} from '../services';
import * as fs from 'fs';

export class TodoController {
  constructor(
    @repository(TodoRepository) protected todoRepo: TodoRepository,
    @inject('services.GeocoderService') protected geoService: GeocoderService,
    @inject(RestBindings.Http.RESPONSE) protected response?: Response,
  ) {}

  @post('/todos', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async createTodo(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {title: 'NewTodo', exclude: ['id']}),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    if (todo.remindAtAddress) {
      // TODO(bajtos) handle "address not found"
      const geo = await this.geoService.geocode(todo.remindAtAddress);
      // Encode the coordinates as "lat,lng" (Google Maps API format). See also
      // https://stackoverflow.com/q/7309121/69868
      // https://gis.stackexchange.com/q/7379
      // eslint-disable-next-line require-atomic-updates
      todo.remindAtGeo = `${geo[0].y},${geo[0].x}`;
    }
    return this.todoRepo.create(todo);
  }

  @get('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Todo> {
    return this.todoRepo.findById(id);
  }

  @get('/todos', {
    responses: {
      '200': {
        description: 'Array of Todo model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
          },
        },
      },
    },
  })
  async findTodos(
    @param.query.object('filter', getFilterSchemaFor(Todo))
    filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    return this.todoRepo.find(filter);
  }

  @put('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo PUT success',
      },
    },
  })
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<void> {
    await this.todoRepo.replaceById(id, todo);
  }

  @patch('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo PATCH success',
      },
    },
  })
  async updateTodo(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Partial<Todo>,
  ): Promise<void> {
    await this.todoRepo.updateById(id, todo);
  }

  @del('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo DELETE success',
      },
    },
  })
  async deleteTodo(@param.path.number('id') id: number): Promise<void> {
    await this.todoRepo.deleteById(id);
  }

  @get('/todos/download', {
    responses: {
      '200': {
        description: 'Pdf download success',
        content: {'application/pdf': {schema: {type: 'string'}}}
      }
    }
  })
  async download (): Promise<any> {
      let pdfData = '%PDF-1.7\n' +
        '%����\n' +
        '1 0 obj\n' +
        '<</Type/Catalog/Pages 2 0 R/Lang(en-DE) /StructTreeRoot 10 0 R/MarkInfo<</Marked true>>/Metadata 20 0 R/ViewerPreferences 21 0 R>>\n' +
        'endobj\n' +
        '2 0 obj\n' +
        '<</Type/Pages/Count 1/Kids[ 3 0 R] >>\n' +
        'endobj\n' +
        '3 0 obj\n' +
        '<</Type/Page/Parent 2 0 R/Resources<</Font<</F1 5 0 R>>/ExtGState<</GS7 7 0 R/GS8 8 0 R>>/ProcSet[/PDF/Text/ImageB/ImageC/ImageI] >>/MediaBox[ 0 0 595.32 841.92] /Contents 4 0 R/Group<</Type/Group/S/Transparency/CS/DeviceRGB>>/Tabs/S/StructParents 0>>\n' +
        'endobj\n' +
        '4 0 obj\n' +
        '<</Filter/FlateDecode/Length 184>>\n' +
        'stream\n' +
        'x�����0 ��&}�[JEJB��hd04q0$"�D���@t���\\�>�����n��sH���حu�\'\t�<Ë)�,cB� \n' +
        '���h%"�=%����)(%���S2�%BOHO#\f"�\n' +
        '�c�u�n���-ά����l��\n' +
        '#�X�͚��W�%��q��Lj����iAY\t������6E<y\n' +
        'endstream\n' +
        'endobj\n' +
        '5 0 obj\n' +
        '<</Type/Font/Subtype/TrueType/Name/F1/BaseFont/BCDEEE+Calibri/Encoding/WinAnsiEncoding/FontDescriptor 6 0 R/FirstChar 32/LastChar 116/Widths 18 0 R>>\n' +
        'endobj\n' +
        '6 0 obj\n' +
        '<</Type/FontDescriptor/FontName/BCDEEE+Calibri/Flags 32/ItalicAngle 0/Ascent 750/Descent -250/CapHeight 750/AvgWidth 521/MaxWidth 1743/FontWeight 400/XHeight 250/StemV 52/FontBBox[ -503 -250 1240 750] /FontFile2 19 0 R>>\n' +
        'endobj\n' +
        '7 0 obj\n' +
        '<</Type/ExtGState/BM/Normal/ca 1>>\n' +
        'endobj\n' +
        '8 0 obj\n' +
        '<</Type/ExtGState/BM/Normal/CA 1>>\n' +
        'endobj\n' +
        '9 0 obj\n' +
        '<</Author(Lars Ripkens) /Creator(�� M i c r o s o f t �   W o r d   f � r   O f f i c e   3 6 5) /CreationDate(D:20191220101450+01\'00\') /ModDate(D:20191220101450+01\'00\') /Producer(�� M i c r o s o f t �   W o r d   f � r   O f f i c e   3 6 5) >>\n' +
        'endobj\n' +
        '17 0 obj\n' +
        '<</Type/ObjStm/N 7/First 46/Filter/FlateDecode/Length 296>>\n' +
        'stream\n' +
        'x�mQ�j�0}������c ʆXJ+���]\n' +
        '���)��/w��_�97眜$"� D� �A���ubQ8B���� LY@�9���_\tsg�ҭkjp[@p L+\bY�\\N\'�%,+Sv\n' +
        'i��)�Jv��5R�-Qf���Դ�W��y��>�w�.O8&�cF�\t�ܖ� �����&����A�^z47̩t�A�D����ß�V���<x�>A:e���S�҃_�e��h��q{��g"�%�di͈���:�+%kS�y�N4���xYee�Uu���&]������Ȇڢ����N~ T\n' +
        '��\n' +
        'endstream\n' +
        'endobj\n' +
        '18 0 obj\n' +
        '[ 226 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 615 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 487 0 0 0 0 0 0 0 0 0 0 0 0 479 0 0 0 498 0 0 0 0 0 0 0 0 0 0 0 0 0 391 335] \n' +
        'endobj\n' +
        '19 0 obj\n' +
        '<</Filter/FlateDecode/Length 23505/Length1 87928>>\n' +
        'stream\n' +
        'x��}x�U��9�;-��d&u�I��\fI�I\b��\t-C�`0\t-!���HQ��\bŲV��]A�\f �X�^���]׵aٵ %���>sB��o��t���y�{��<����O�"a�1fÇ�Օ��M�%��|1cjGy���]�g�g|�s�)�\'M�t�c��Q�ԪkXP�xOflc�^��cN_�޹����m��1�C͋�-X�zc�a��׺�y����d,s@KS}�\t+���\n' +
        'i��zo�~�ː�ݲ`��N��B�c��oi]�Pߞ��c�C�/�?cqs���oAy���e�ם��tƋ�H�]X��馃��a\\)dl��ŋ�.�v�u�Q~����2R[e��>cb.\fC�U�[2\'v��,n؃��zN��+&:x�-�s�$����P�����������>�Z:�R�\b������p�S�yl=cqC��r��|�2�g&�F}>��E����)�ĔX��(:U�}��w�f���z �0��fo�s��MJ���n����ǈ��]�����/n��ٖ_��_�\fo���U?b��ٳ����M��n9��������`�u���?a&��-W��~���;���f����\n' +
        'X�q�;�f��ϋدc�3l�i�ê~�������}��>S����o�����迳1J\'������*X\t������X�"���\'�\\ϣ2����o���b�`v�o݇�E,b��n��X�/ٞ:�]�>s�O�QNf�_�?�X�"��E,b�X�"�߷E~ΌX�"��E,b�X�"��E,b�������X�"��E,b�X�"��E,b�X�"��E,b�X�"��E,b�X�"��E,b�X�"��E,b��úw��=�X�~cS�H�%����R�f:��������5V����6�ճ&��mJ�^��wGe>��.��)�Ȗ�P�w�3���{f��^����z�?����k5�zbOձ�5<������u��?��_��7��V�1Ka?o�h������9����T�OvC��O��1�~L�E[�?�����_�t�i�-\\�z�)�[�575Ν3{���5ՁiS�TM�4q��qc+ǌ�(/+-�/9b���E�\'\n' +
        '��?7�OVfoo�ˑ`��Z��Q&�A�S�rʽu�`V]P��3&W���p����8�L�]�s_ҏ��\'��SIOInsg�ss��^w��2����VUCo(�ָ��5=AӺ,-aE��A\n' +
        'w�����u��`��-��ueh��]�-m���a�fH3T��wq�3�kB�S>�Ca&�xlP�,�o\fN��./sz<5���jm\n' +
        '�A�֖{��3��ݑ����N�[�4z�gV�zTjW������`_oY��:0�`���<��qSz���L����-C��??�S�2m�2!�{�\t�R3�\n' +
        '=��<ї�:�l.���jJ��\\g���|5A�N��9���&sz��y=b����ߧ�8�msݹ9�}�;��wլ��\n' +
        '-��ڽee4oӪ��2\b}x���P����/���:��]L�P8�b\n' +
        '�O�֪��J���!\\+�W^&��.o�+����U�;Y~�n��|V�jD?�I�X������栫�و���vz��L_����F������ў����N(-��3M�jũֈՂ�]�o�pdذ\\ZR�h�pw5w2Y\fO\t��v�P3Kǈ,UT-���x�~�K�p���A�1m����=�\'�F�E���˛ʎ��q���\f����T�\\��&��cd������f4�XE�;�&���M�/��r���km}�M������V;�K����BJ��2��bV��rY��h-ݓsBv����~��7v05Slegׄ�����$_�78����~��t���3��g�ם���붹+��;���w�����Z��\\�{+۽S��;��O�^�<S<;���㦕�)��tx�U~~����6��.�VR�RZWR��y�;݌�5�"��)n�-MA¤�w��3֦��4��n��L󙤏��N�|6zP�� ?♆N��ei|&�Q�>��&��D�.���Nd�u01��h����[��)�<�P6���n���9Esw�(�s��Ҕp�6���z.���GA��z���}�%J�a:Z���>)w7��������F�,\t{�<Ƚ#YP�D�\n' +
        '�`���$h��\b���� �F�|�ı���m���"Ɖ�fNNgMM�;���U{�w���,�j��Q>����cQn�@ܣ�m\n' +
        '��,P-�3+jp.e�(R�BQ�P�B�#�*5`��{5\t7����`�O<�z~�v^mA6�;4hȢ6�Y�Ay5�q�A�僳��^P�ƦV�ǉ$VC�d���\n' +
        '^d5Թi�L�Y��E��<M��uYM���L&��f������h�B���;G�i����k���x�-hF�����p��*E_�]E�Tu�)�3pu�Nk-��fV���F���xee����6���(Fn���J��˻�s���o?���s\'*�i?�����1��j��v���+�|��=�9���V �\n' +
        '��7w�xUz�v(}s���z�Q2�8>wc�(�.O�,ď)$^�Z���a2��)Z����-=�\n' +
        '���)��P�]��r�3؊�)��q��mޡ^�U-P�E�9���u�д5���b�������v�6ԇ�-���B�qM�\\pl4$�l�쮫q�!4�U����nF�����4�ɵZ�R�.�8C�R�\f�bj�o�z�\t��f_�Q>6����mj���|�]� |/�y�D\b�,"�&�n��͎h�Y��Yn�[�KL���⣡]��|�\t{{\\���W�,�=tY\n' +
        '���o$����N�0\t�"U���`T�(HG@�f��c�1�G�^��&�U�lJup�,��\'!N���Bd���)���REv%�׏]���AeZuxy�����S.U�G{���W��F��f:1�?���A5UyZy�2��T��e��[,�����0�~\n' +
        '��*����G���?�L���\n' +
        '�i�ڣ�ہ������83�>g\t��\fh�Wz�}y��E����mQ>z��Jq�mR�-�)VK�J���8S��R�!�\n' +
        ')N�b�ˤX*�iR,�b��X E��Jq��h�b��R4I�(E�s����N�9R̖b�3��!E�5RTKq�ӥ\bH1M��RL��J��RL�b��/�8)�JQ)�)FKQ!E�eR�JQ"�()�RK1R�R\f�b�C�(��P���"�`)\n' +
        '�ȗb�� E���ȕ"G\n' +
        '����+E)��Ȓ"S��Rx�Ȑ�#�[\n' +
        '���H�"M\n' +
        '��R�H�"Y�$)�H�"^�8)�Rؤ��"F\n' +
        '�)�RDK%�I\n' +
        '�)�R�P�P��R����RtIqD��R��?Hq@���N�o��F�I�O)���+)���)�K��I��H����#)�.ŇR�M��J�O��x_���xW�w�x[�����oJ��K�{�xU�W�xY���xQ��x^��xV�g���OK�OJ�{����K���xT�G�xX���xP�]R씢S�R< �v)�I�U��R��_����W�-Rl��)�(��R�%ŝR�!��R�&ŭR�"�&)n��&)n��)���:)6Jq��Hq�WIq�WH�).��2).��)6Hq�I�.ŅR\\ �z)�Iq�2��2��2��2��2��2��2��2��2��2��2��2��2��2��2��2��2��2��K������������������������������������������������������������������a�a�a������������������/�*D��6�k�1s�W"�\\J��5�F���քzY@�)���,�3�V��G��\b���V�N���Qj)�r�J/-&ZD���, j%:5�V:�h>Q�<��PZ��R�D\n' +
        'Ds����ͦz�(5�hQ-Q\n' +
        'Q5��DӉDӈ�M!�"�L4�h"���D�Ɔ���J�1!�X�h���s�<�*#*%*��QT�OTL�F� N%�\n' +
        '��ED�D\'\n' +
        '!L��S+��\n' +
        '����S�\\�"Q?��D}����,�Lj�7��(��������Q:Q��(5�:�B�\b�N%%�3�(���DqDvʳŒ3��Jd�<3Q4Q噈�D�P�d�>�R���T(ŉ�F���K+P�0�!�����}O�ѷ!�4�7!�Tп(�O������/)��~��)�3�O��\t��D� �����RR�o��+�>�(�}����.�;Do�EE�B�7��\b%�\fz=�<��^r�J�\n' +
        '��D/Q��^ ��D�=K�\f�3���|��I�\'����J>N�ǈv=Jy�=L·�$�E����J��Dۉ�m\n' +
        '%�B���� ��D��K��h3�=�$�������DwQޝDw�NtѭD�m"����Z���ʻ��:��D�R�k(u5�UDWR����.��ˈ.%��h��T�"J�]Ht�z�u��z���Ĺ��D��A��J\f��B����١�!�5D���*�wљ��F�J�~�\n' +
        '�Ӊ�-#ZJM/��-%6�Qc���V�S�N!�O�Z��QϚ�zQ#�l �KTOTG4�h6\n' +
        'z�l&�\ft-5]C�&:��;��V�M%�BTJ��&��&����J84!��OE��\n' +
        '% .���C4����5��P�zPY(�lPi(�\n' +
        'T�� �"��\f����GPjx�^F44d[���0d\n' +
        ':)d�\n' +
        '\t�kA�)��(?d�\n' +
        '��Cv1�!�8�yD��z.=!��G��#�K��!�&�"�\f��,�&�R�Ԧ�sS+.�^T/�(��I�J���9B�٠�m(�(�(�(�(�*ة����D1DV"�4S�hrF���D*���:r�D\n' +
        '\'b��ع.���ב�F�a�C�A����=��-�\n' +
        '��������\n' +
        '������g���O��� ��s�=���!�7��>�> �����;ශ��� oZOu�a�z���յך�zx�e����"���9�׳��@��i�)����]OZ[\\OX��������c��{7>���zȲ���e�k�e�k\'�\t��`;�!o+|!�\b��W��3��׼ʵżڵټ�u�G�n�.�N�s��v�m���sx��T���7A�\b� }=ںmmD[��w\n' +
        'p5pp%p�Ի�]=�ui�$�%��\\��p]}��|5ӵV-t��]���ln�XX�yu����W;W�[}��ͫ�^�3D�\n' +
        '�8k󙁕��36�\b�Rֱf�|���雗t��/[�~��o^�˖�˹ۖ����e�%����ؒ�Kږ���|�DaKxtg��K��*��UK������7/\n' +
        ',l^8�_8/вy^���1д�1�P87P_X�S8+0{�������͵������(?�pZ �yZ`jaU`�������O(�y\\`l�@��1�х�r\f�����i�Mt`bz�d�������SǜA�n���JU�Ʀ��I)|Q��)��������7�"6������L�������`I�$w��(Ɩ4aZ���e�kcu%y�*byl�+Q)�2��c*wsθ\n' +
        '��PfOtU�s�uz��el�o\\��M4M��3��OUm�pA�jgTwp~I��;\t��K%Z��\n' +
        'Xzɸ`��ꐺiSzI͸`��~����f(R㛽t�R_��`�ʮ&>j{Ѧ������X����Ƹb����c�TkuY��mU��Vx���-��UĚ]f%Pl�dV����\n' +
        '�9w@���V1Nz�o�l|�^�̧}#U×��Ox���eH���Z��~֨h�R�2�\\������;��7�M�Q��Z֨����gk���*�,�L`%p�8X,����E�B`�\n' +
        '�\n' +
        '��Z�y@3�4\n' +
        '�\\��� ��Y�L`P� ����t  L�S�*`20\t�\bL �〱@%0\n' +
        'T �@P\n' +
        '� � ?P\f�F Áa�P�\b(N� �� \f y@ �|@?�/����L�7�2 �\\@/ H�@*�8�d \tH�x �6 ���0�@`����Q��T� c�>�������{�;�[��_�?�����/�/�����g���\'���?�����\n' +
        '�> ��������\t����^^^^^^ �����\f<\n' +
        '<<\t<��<<�v;�N`� ��lB@���� ��{�?wwww ���� ���������뀍���5���U�����ˁˀK�K�\n' +
        '���E@;p!p�X��G�q����q�9�?���8����s����q�9�?���8����s���ϗ �8� �;���8� �;���8� �;���8� �;���8� �;���8� �;���8� �;���8� �;���8����s�}���q�9�>���8�g���s�}���[�ÿs���;�;7�t�1��0ǜٌ1�M�u]q��;2���6|�c��Q�6��΃��6�;�Y�=�������W�����̢�`�X����]w���c<W �s�tۺ�8��E�ݶ�NC���Z�W��?�}�\\������:V������:a�X-��f�Y���c������̜�Z��PK-D�<|6#5�p�h�h�El1��-c����Z\f�4�y�i��l��`+ٙ�,�����<��s��>X���ʜ��Քd��ֲ�j���M]أ��E�b��%�ҟ��K]������dW��ٵ�׳N�^���c7���gD�U�ܬ)��{�mg�����\\6`�hF�4ks�s�\n' +
        '#<����虭5�[{x�g��15Nϣ(yJR+����\'��e�#��U���z��������ᘙ�^K\tu������F��[�)fU�[�Iݬ�c�7��ݤ�oc��;�wiJ2y�ݍ�}�̶��>V����V.�:X�me۰���S��\\ޏ������N��=��\bۍ��q|I���=���|�~��\tiQ�RO��pC=Þeϱ�H��}>��K��*{�[�^f���\b{I�!�a����.��\n' +
        'l6��K�n\'�>�%�M��WtPǰf>\n' +
        '���6v1~b_x�$w�h�_Y����:���[���[��dzܚK�Wp˩�Ȋ�6�]<�W��"JIbC���ee�\\�#�@�F\fcb���cu�uGjj�w�`��^��s�7 :/>�ޑ򎼷?�(o?�{w�{�l_�`/��߷w��NB�uG+���h�6���bQ��Z�W�Zш�ؗ���<�>4�0���=v\n' +
        '\t1�ј`�f�Wgg\n' +
        '��4R\\��͈Q4_���F���z)j��TD����U\'1(k������Rc������i�:#sx�t�j4�z���I%�Z�3�2�����L�����t����������*յ�R5\f�Y�[�6ڤ�\f��^��~�<��c�m:s�͞d2��-}�fY��&�HKL���L�tnaLw)f?��صb������\t�X|$X�g��Ì���c��oE���Ɔ٪�w[-��S�ZQ��-��*g\'���Oc����&����^��f9;b�ܲ�5�J/J�ZQKP�M��FOF�`{��|��X�_�z�b�u�N��;��H��7�g���U�ݳ���U�,)R����S\\ٺs�]\'������׎=l���lK�A�#�^��m��x�b0 9//��á\n' +
        '��d�b���=�b��-f-چ���(-f-z�u��� �z�2;��y���\n' +
        '�>U�@\\@`Ű��"{~1���ydϷ�({ш��|{��,��8�\bf-Sn>��ǨBes���Y �m/%��slV!\n' +
        '>S�+%�oR��UsbzBb���5���)w�1������W��:s�++eA�3ޒj��z�Ť�w�Jc�Q��\n' +
        '؜{�w��mI��<|�zg�~)���D�Al�A�\n' +
        '�Akk���Ǽ9�L��L(f\b��!����k`\b��AL��{�v��\n' +
        'q�����*�����x��km����`�9C�tQb[�Vs�ԳǎN�G[���7tQVSו�O�##A(�I�Ǉ��d����ħ�M�n��\\�=->��N�\n' +
        '��P��z�>�41���lK��S����,7���Ne��Ʋ2��e�X�қ�Z�-bc�k�W�S�{�ً��Rm���\n' +
        '5,�Z��qP%*����d�.��l�Q섬�!\'q��%��G}˨ڲ<���zr��.:�wZ�7F1��:�#�W��g6�������I�1:�`���Y�Ť�c��\'�1F��Ҳ�ں�ſ\bpc�aD��^I�y�R$�%���!����~��\n' +
        '�Z��8~h�i�;hE�q����_=\\���C\t�{\'p{�c��ַ^~Y��u�s�F�{��=��k]3��yC1���/��Š9�Z��#5�K�rǻ�YT��YY������#�I�/*�˳�$:���}+�YS�Z\n' +
        '�C����E扷V"m�$�a4��C�A�3��:��]u|�S���7�\f�ťڍ4���k�z�hK���،]wm)�Ⱥ�0�Bv�ٶ���l\\����\fk^tnnFA�H�Y����$���՘�b�4q{�hߠ8\\7qEE,��o���ms�]�k?w�$%ꛌ���w�Q�H��wS�ڵQ1ƹSR\\q�,G�+ǃ������x��5��N����8��bQ\n' +
        'Qu��{�Oe��%s�@y�W�T�;Cۉ8{7`>�5��ɢ��mm>{�����av���i>�GÆ%}�nLφ��E؞����\\��m�8�0�G�(�.��5\\VL���E��Evv�{�$ȥ7�R�����c6�\n' +
        '���4�\'1Z��{���yڕ�I0ag�֝?c@������[M������W]2r⠔x#&A��1��_Y^jפ��x֓�U1oT���A6�g���\'�)�{�ᾔ��R����Z���rX7��cki^J���YY1����X̀Nn�G��!�T�kƶ�?����c?Y;��h흵7Mё��Ů��C�RG�V��Z��C�V=^������z�/���\n' +
        '��<��AKU��\n' +
        '��aVbB/�rxX�%S��l3��Ŝ[Q?<w�I._E�����\n' +
        'f��oJ��-?��wĔ�l�#gt����9<{�I9q�4�ٖhKHO�J��\'���wD^f����Q��c�ڒRb�v�->�nJMOM��O����gP�lq�Ұ�F�Ŀ�1T�I��ikR����c�:�[¯�=_?!�>:���֪�}�~��326�k_T�\'%ՅW�>y-(��V���>�g�ט��v����f�~�X}F���iq�;��U�W����,x��X�@�)�X_�ɿ�ǰ��X�-LD3l�x���P񺵆�L�M�ک��\t��\'X��@����^P�T�N���\f���K�����X&�X^�F�%�jy�N�=KF�{|�g�Q�3\b��l�:Vs2/H~�U���5���2x�m�O����XˈwZE�����;g�,������Σ������}|[ŕ��WW�e˒��u��mY��W�X�mYv�Bv!X�d[�ZR$9�!�1!\bK�&�~4-}���� �/\bۥ��P>�B\tKK)��[H�${f�,9�\n' +
        '������C�f�9s���93W##.3a`��H�[h�s���s46\tZ4���"�ʽw�.�Y�7�]_ۻ�"_g�B���bӚ��z߮�����_S����ȠP�D\n' +
        'ť-�2���;�U��o0A\\I4F�� ��@gYw��|nMK�{`M�h|��$Q�??�>*jYI�M+�gV�]�\n' +
        '�]�+��V|��,���Ǒ7l�&��o�l��l��l�R2�LW얯�0Ѫ*�%C��>��v��o༟�+G���DG��k�R���SG�Q �KV�T��\\-?�s����ų�I��6?=�t�u����f���+�np���\f�6H��zM[�%MƜ�!W�ENw�vX�\n' +
        '�t�P�\n' +
        '�Ŀ��������h��lX�jd��m.pQVUk-�{9�{̀j��x�[ekli\f7\n' +
        't\fz�a�S��آ�,\b]�݂��Q�/�U���P��z�Qvx�������\f4»����,������Oi���m/�w�VET�J�V~�<�<�ML �+՗��^�`�\\F[�f�b嶗��.��-�PiT�Z�ʗ�ł,�JQ��迼:�Qx��eG��(�Sш}!�Ua<��Bw�b��Ӧ������C[��G�Wm98z�ᚯ\tf�/ڸzEQ�k�\n' +
        'Ys�r�*c�R�Vȍ���*�����b��D7���hB���R_��g\'ލD�r5�{W�\n' +
        '��b����^�(yE8u�{�Z� Gy���9��]���3.�h�8xa�p�>X�e�"��cMYe���,�<*9x[,��N��InAi����\\"��DY������ռ�@Y\\Z��a�;�/�J�RI�����!�\\B�p�G��f��ƶ\n' +
        '�@"�IU&����Գ�I\'��񨰭mY۷�����x\b\\<F.~R��7t|]ÿ��;�����Q�P�PܚP�0�ta������G��?e(�+�Ю@_�(y-����J��mm�vX�\n' +
        '��MZ��_�L��.�������hq�\\���/�,�?�rk~u�A�Y�d}����f\t�F�h*Nb�_�X�P�&+�!��~,�n�w��<[�i�׾�ݮ�ѰG�W�\f-�js�*���.vVTz���z�+s�� �I��;mU���ӻn�YA��Y��\\cvi�.O#61���Ʋ�zsѲ��C�|�EV�F��k�.[o��J��\n' +
        'ffYժA��pR&�����8��|�\bs!�?TZ���FH$�f�Q=�\n' +
        '�tj���{�\'z��-L��o�ҽ�mo�w��\n' +
        '�^�w}ݏʯ�Z����F���s3$�����%���S m��!\t����}j������4@h�Z�g�h����x5^���c]Y�#Fs������葢!��J9?U;�R��*<j5��E���t�VV���+���疗\'�S��Dh�Od1�$ٿ�l�w���W���3�UF�Js��V� m�5t�:��!Rӿy��:K�k�xàw�`��>K��F��,?[,���˴z�\\������z)S\n' +
        '{Aqת�M��Zw��+�)<Kt4�?��}��"��S�&|��:t��Mbm���9%��\n' +
        '�L*T ��O�����\'���q��$�%5|N��sE\n' +
        '�+j��@\n' +
        '�WkPU�*kJ<ʅ\\O-\n' +
        '#1F�P��W�c���D/�����U.��q-1y�c-��-}����5jR�a*��n���Z�g���Z�%�C[)@��#�4?["�\n' +
        '��\n' +
        '�iT�X�(.Z���Y1���_�I�5�ѷm.�k���KЬ+R�Q�\n' +
        'ՃD���Y����=��U�B�\'�Xֳ1�c�y؆��������ͩ�6���Cx4J.�4\\�j�^`<eYxcT�#ޘ����Hf��)(�m*%`-N�Pڳ!L?\'�V�Y�Rxʕ�%,��B�١\'�@\t�5��\t��5v@��@�#\'kT2�\t�pgi��J��\\�!��G`�N��)�h����BQ��J�ӌ�܎()!`W��Y�.;�0������[�V�j����4}F���*�1AD�ȼ6���2�� ��9{Yª��k(��l:���Ț>�b���J�?�G���\ta1)�> PNSaq^��͖��E�l렲���lUM�D��Z鿨��y;���Y����z]��+�e�zKK���F_b��Wf�hK�uم���۬B��+*J+ +`u�HK�\n' +
        'ĥ+�����%��!ovj�E�F��|H���yE\n' +
        '6x��3�͇X����" �g\'�s�ڲ��W��z���[��y�늖Z�Y�����ӈv�;̥�EjE�����J�F��ER��Vk��r�����I�PB�Dxj�je�[KJ�\n' +
        '��\n' +
        '�i�lA|�Vb;~�����hMZ���Qr�3�0���TR�^m�\n' +
        '���-��x�3�-�#����T��,���4i@?�r�l1H��אY��{���\t[~�ޙ\n' +
        '��N�ͪ\\S[��(��$�eյḾ]���0o���J�KuM�+.����\n' +
        ']^�Q��\n' +
        '�po�2�75j�ks���h7�Rϐ���F�^�G���<�|Ŗe��HNlq���<���B6�.޿��n#2�����s��\n' +
        '%ru�V�ϔ�Νƒ�\\CUy�NU��?�Tb�H(7�N����w)x�U(:�̹Z"R�k�\'������}���|��0��Qr���PT�=^�n-U۸ϸBX�E�����ZJ��\'��~�ty��Jβڪ�,Sk��e��X�W+ۋ���Z�~+�/>��.?�β&x�J/nT`��,��lh`VZ�"�PL�\n' +
        '̍e5��Vw�T2+.v�U�ɅpG(җڊ��-]-U���55�Z���Q�BM�zYE~qn���P��Z/U(epG�*5�ʼ���l5�z\t����K���^\'J�*��5:��(\\q�Q~�.\\}����ch�wl��\'>�0�)\n' +
        '�*�`�:�N~����b���]��r.����1}��/�&�����L_X����?�o���V�*�\\D���@�7�as�qYn(�7\\#�e���5��é?�:Դ<��H���ɗ�����(ç�2S��\n' +
        'a�ʳ`�#�2\'�C���lJ�6\b�y5uKOR(F\'��Yb-)�)�7��HTR����� �*���F)9%Q�g1�D�=E�B(Rh�(�6������\\n�Ayg��� }�p9wZ���C�P+�k�@� �j�g��F�\t}����S��ԟK�b�)Go҈H�HW�oZ�K��҂��\\�4�<��T/%�<����\n' +
        '�L(���1SPa��\n' +
        'f�Lf4�η\n' +
        'ƨ�\t�RQ5�wh: �c��ɉ�\b�c�4Ty}�KZ�9�\n' +
        '"MnV�A-ʕe����䩛���傝\tXɟ$J�j��4��cĥ�et/!&�D.QDT6�\t�B�G�\'� Ɖ01M\\Gv���P�;�.߶}�vs$n�3��R��ӭ�&�mt��^�]�n������ۺ����8��������ޭk���}���Pc(��M����C�!�y�h��ʪ�n�6�ih�պzhS�ڭ��e��혖{h���1��/$��Iz�������YNly�TE��e\n' +
        '�u�\n' +
        '�]ǿ�����%���K�����%��\t^�������u�u���t�����jk�(/���C\n' +
        '�\n' +
        'Iޓ߲�;�dm}}-�4�yj#�~������p�C������}*�PBҮ��C���J��z��N���&���z{�\n' +
        '�O�D=G�\'�\n' +
        '%�|� p�\'�W�oB�\b���3���@����k��L�t�In8,5�+�n<�7/��\'�/,��R�Yt�aQ�<7�z�Y�~�I�W?����*�I����õ�dj�����\\�W��cw:�C����ƦQ���k��\'`\n' +
        '�- V�x�TcD�Yb��7��ia͕\n' +
        'ͨT�Ƅ��#��f��w���q���%��p�Ky%�3�tu����5��I%�=)U���JJ�L�b�Z��B�;�1jD?</��1fu�t\n' +
        ')�:,��)��\bЊC�h(M����"�\'�D)���"�B�$x��\'2"x�xؠe��E*b�������EY�l�N��RN�JR�d(/��Pk�֙��fV �m-U&��(��Թj�ɩ�����Ak�\b�C��G_��3�ˆ\n' +
        'v�\t����v�.�3! $B���쵂�b7���-�?�A��?��>%:������#�J����%��\t�\t�S聿�D�2�y��?.If8�/��v�������I��R�����jN�^�2��O�5i��E�\fe���+/�ZϠ�i4��\fe(C�P�0}e)eU��L�2��\fe(C���=ݔ�\fe(C�P�2��\fe(C�P�2��\fe(C�P�2�@wf(C���[�j\\�Hip*��\n' +
        '��� U�!�, J���2��#$\f���eQJ���Jȗ%D��Z�,%�_�Q��rbH�e�� ��\'��R%�$�T]���=)ћ�2I�s�|�"ĆY�, \f���2��#$�/�eQJ��Xi�_�9z_��|YF�\'��D��}�� r��|Y)���(A�RP.K���\\�Ù+s8se:��Ù+�R�9��2�3W�p���\\�Ù+s8se��������\f� �D-�J=���D����1"m��W"�ߊ�AKJ!�\n' +
        'w\\�^h\'&�^\f�� �p����@iZ�4p� �$fp�!�A�\fȝ�#�Pǚ0�/�g!��I�l\'�T��5<�$D���q}0�1Jl�y��6����K�3��!�58�>c�X���Z}�t99a�R�2wG��\tt��o�L���@�n�!:A\'�N�a\\W��� &aL��_^�/��cاA�%�E;��8h��1@�[Ė�v���$��4����1��A�����ɚ��4����wDF��b��d/���q)Nj�č��bMCx��S\'������dD��\f~�|�6qX�pT�@���W�\bߞe��\b�e\bZ&��FjQ4bے�[NwG\n' +
        '��\t>r�V�7C�o��q-�}��k3nΏ!ޮ0�vs.j�jBm��Y��V<wS�Y��Mb\t3�)~��❈���~�/Q\n' +
        '�\n' +
        '`_�ȍ$��t�ybP���+8mMzɇc̀�4��g4���G��8��c_�;g��3��#\'�� ���ܑ�c�q$�Q6\'}�83�̓�|\\G��(r9���?�c��M��e2��M��MF\t3�e��}���QƚŁP�j&l@~�-�9yF�X���Ay��8�"�hE��a����d�H�1�-��8Yg����\b��C!�yu��43i�x��\t�D^�s7�����Q���#��8)���sr g� ���n���R���\\�D�hK�`��L��\n' +
        '~�i�_}��ɍkI���.�N�:5q̦yK�x��xNq3�L�Qne1eZ�]:��_�m���Vw�_���s�i��RWťz�L�d\tg�[H��hr���ko\b��9-�bϗU\\>\b�W�*�<�����x򹅓�8Y����\\�Y���!��]��wAg�Օ8_x;���Qm���ᲟH쯖湥3��$/p���;� �>��B����g�e^�$wV�w1[,��|���W&���\f� ��W�8?%��۝��*���[�Qy�Uy�?9sb){��\\������n�6G��\'����E㼟q��U���p#��ۇ�LD��X\\��O�I�|�v�[���~~���{��5u�\f��x\f�&��}��u�]���?�\t!u>\\�<b�&�}��fY���/��⧂��z-��g��J��H<����D=�!����x�HYa9�G�.~��J�25�p>����Y�&uH���X�pTSWx��ԕ&=����8N��~L�S��C&���_ј��\\\t�)kG�<����~lAb�kN���nl+.�m��kDb�I}>K�g�)�b8Wp���>���;�G�I�c8JCX:7��|��k# ��y�v|��pCm=��^��\tm\fdQ/��Z��AKp\f��+����u�|�����µ�p�s\f���Z��Y�o;q\t��\n' +
        '`N/���������в�܁� 7^/��!:�5��tڙ���Zu���@��=�]�����h|7.�&�t�0FH2��\n' +
        'u�j]���7��wa�9m{�\n' +
        'n���Ҏ5@#[y[9>���\b��\n' +
        '�h�c���,��\n' +
        '���9��w�\n' +
        '�=۰��v3dm7�-Z�y�[�PE�A��u$���+��7EZ:v���E.�>m�����V\\ľBw-�/�؎���Ǒ؎�\\��d��q�r�\'���/En<��T]Q͜g�pR���>��c��H�|.�07�c���LOp4����Lk8\tG}�`8de\\,�x����\n' +
        '�ѭ�U�\t�D�L_$���n�Lx*ΰ���(3��DQI��1����x}ld���B�������\b1�)\f�38�1l���p�Ya��>��G�0\f���S�� �ԝ�E�T��2� ��9�tG�X`%���H����ke���h4A��1���/�Ƭ�>68\n' +
        '�1|�d�8�P\f�D�c̘o2��0������&�q��qP\n' +
        'X�I�� �P �2�qf,��OE1& +�qc4fab�>�u��2�29�ƃ��\fD�3�c1&\n' +
        '�7�� �e�����\'#��8\f1q�5h]���cF��X07P<�-���V�7�"�L�B3��������>�%�!D�If*�����^��0���c���X(xF\'|QP,�z�S�/�������(� "�F��.\n' +
        '�x��L����إ���#�y4\f懂���{j��U���h8���#�f���Y\'=������ǣ��Č�7q�X�������! ��ME"lݳ2�S��\f3!G������x�����\b0��H4\bwG�% �>pc :��A��\f�*� �M8�(��,g�q���[P8n���\'1 �gz"8:���4\f\f��S��ڇC)�`%7-R�A����f�:�=�G��L\f��0!k%F��Q`N�TE3���a�?=D��C��x��?��D<6��(�%�]�9$���Dp$G�I9\b*���lA*�P[�_\ft\n' +
        '���"�3��u:�9\t��>k8:nC5p^��Jp/<���\'��%���݈�y�a�\tAs��Ć�NO�\bʴD�T�#������ ��d�f,\n' +
        'IM���`3���Bw&<�.�@��D����)��£A��g��Bq�O�, cFӬe�L�|%�ȏ�!燳��<��S���>q�\n' +
        'B�rc#YQn���$BZP.��� $2�&���#Sh��P#%`�\n' +
        '\f�P�G�\\F=��܄�!�I�#����\bO��F4\n' +
        '��!P&��ÐC�.WF� [�c\b~O�f.�!�m\n' +
        '�,��pM.��i�E\n' +
        '+6�փ�@����E���LApQr�9 h�yڙ�>��z����`��}C�m�mL�k �f}砧o� ^W����͸z70k;{�,L�%�������t��ww�C[gok�����f\n' +
        '���u�f"\b�cЀ����$����ꁪkMgw�����E2� ���������]^����o��o����n/�����;\bKn/�1�CPa<��n<�kh������o�vvxO_w[;4�i�\\k�۹����nWg��is��:�q�>���l�v�=��\t�s����}�Ȍ־�A/T-`�w0�u}�@��qy; no�GpB�>,���sR�L�G���\n' +
        '�/�����Y�s*�U�9�|l3��ޱ�\f��\n' +
        '�}\n' +
        'p��d�2��づ�<sD�~D�@\'sL�9&���;&�����A�6;���(��i��6����\f�;\n' +
        'xH�B��J��B��j���ʯ� ~j���k������t������K�����GRD�G8�B���Mt�{�u��aA�B��~����X2l �dx@� ��2� c+�����e��*�Q2�@F�����1����v�s���Rd�A�d4��V�1 2� �A�4ȸz λ�eP)24 �d���d���Ș�Cσ�y���( � c-�� 26���q�8 2�\n' +
        '=��O����H���];��]���Ȏ�*��K"��\'�%�"�m�vm�\bI�X��P��]\'fg����>>�^"��"�G��b���w��KHRBc�Y0F@J�LW@JJ�O�>1�e��@��Υ�THJA��&h��=���FPQx��M$4!���*R���p�H�.R1)���1�^;NHe�Tq^_r~ɹ�n ����Oi��XH� P��\t���Ih���cv��"R,ٶc�ǳ���4)�U�Ee�ivX�9.�\t��W�i���L��j��I�h�dR&�x�z���X&\'e�#�G�A�{���-@;�dbB&I������2r)G����!{����t��$%O(�k\'���%�\\vb\'����r%)W1144���� ��(�Q2\'��\ty���|�!���\n' +
        ')�f7r���]ކtl[.�I��Wr�`d@(��\t&��Vӹ\\AR\n' +
        '�l��\n' +
        '1RT!#�S�Q��#)�\'f�Ξ"*R�9�<��U?��ľ��k��<����GG\n' +
        '\t���6,�p�lJ$�����ݪ��J� ^+Ǐ���J��{�SG�����q~<���J��9�-_�{�\\\b0��^˕�-*G9"�Jɏы˪�����φ���5ƕ�P���XWt2daZg����\b�7�k�� ��\t�����C���@b=�_��=�S���\\�gDҪ���(I1up�`4�R$Y+�KE�j���v�HV-"ir��"���햔��/���0��x?�g�Ո��)���{�|��\n' +
        '}T��gW>��ы�J�98gXg������8(�H��Ձ�Om�m$��Q��SveR[R\bzMc5�h��Z7P��kQE�����&���x8T���P�X\'���ᐿ�О�Zd���~����^��t������@�@�7a�[]��\\em�}�����ayCݥP]�R�_�S�Li���r���ﭭ��q��Pk0���ڙ���fw�cyM]SSS�rWScm����(��\n' +
        'p���9rY*¤�̑j�e��\f����]���׏N\\.�a�rݔu���t����_}^�n���#��t��G�9�d��������y��\n' +
        '�����l*����9kd�<sӑ.���?���귎�{��Hޡ�T|Nd�,���ٟt\n' +
        '߹��׎�������5�oDwm���U��?��~�/�9�緯��&wg�m�����W�?�o��?������y�*�N�\\��&��[6�ִ[���Ǝ�&~�`ׯ~����~�\bYe����ߞx��m������k��?���~����+�Q�G�̑R@Dh/ HT���~����vժ�0�o��^F��8�\n' +
        'Jh�]?�]R�^wD���h�G��m8��"�"�Ǿ��y��`��V��w4�.�r@ds���c��-�F�E�D�J+��/I`b\n' +
        '�b����]vO�n�v�����>� ��y$��:�o���"�%R����ˈ��x�������_z$|�c�WW|��s���\n' +
        '��+���\\�N{��N+�|����n�|����C����Y�#�S?���~���4~���oM9���;�����m���7l:�`��_�n|∽B���+f���Ai칧�ɗ��[v[������ݞ�[�ni�?/U>to�}��nc�c�盶�������+���j�/��u��k���fnҼ7���\\�W�:>z��ם\n' +
        '�?h��1~��7I���;v��ֻ�����Ə_��h��]�����;��D$��ߧ�����|������T��Ʈ�T���^�M����� 3Ǉ��X���Z�͚��kkv�z.�-V��OE?������l��GK��o���L����GwY>��{���Y�w�y抛m�u�½�>�~_���U���@�o�냏�?�(;�,��?�_�d���?��]��������5�zyd0���ۥ��\'��~�♭?� v@?�ܭ�����Ff��ކ�����8���������������w]���}k�ǟ����o��@��5��ؖ}o�~g��g���W1����q���bQ�w���D\'z�D�$���D\'"X%ʊ������\b"\\D�^B\n' +
        'A��܈�������>w��}Μg�̜�����sf�|�Q����TոC(:cJ�{�v�{����)���Î7ve3�:vU���(VU�fG.NE�~W�\'�yȪ�g�F���ݍ�1=r��n8�vsHf\n' +
        '"�a����烶a=�$��Z,�:k��[�����Ƌ�T ��I# �E|(?B �\b~;\t@�V��FPD�VDP!,!(!,����;� �"�v�@UO����{���٪<�v������P^�/� F.cT�0V���/A@\\�ط@�#h\b`F+G,P�o����\t�{�dy\f��θH0\b���yĸE��];W7��������[\fF���.*�mϗ&w�̓��I�4�+AߥF�9��.�\n' +
        '٫���<J6?��%�E3v\'��3*E��OT�?��d�0o�b,e�|1��,]+a��Q3��8��%�3��l�\f�A,>��1�$(���d���H:5�E���T�\b�I�1V�g��VN�=CD���o7�tM��������d�^�x��VH��J|j�G�\'��Mn��e�"H������I�L�P���o��ZkPb�ߤ��S���»W��ņ\n' +
        'tU���{��2eO������v�t�*�\b��%bհ۽}�FS�������%��`���y\n' +
        'n�z�k�n��Gx�[�����ܱ�!C4s9��Aݝ\'�zR��L�S������n�C�\b���{�ӑ�VL�΁�4\\5���a3������Ke�\t��\\��\f�XrU�;���YO��M�S�Eq�\n' +
        '�������"׃]AڏB.V�6g�=eB7��ԦV(�g��U�M����~H�ն!A48^uku܃��� !� ��u��~Ɵ����vJB��uk]�t��F�\t��6�#C�����z^^��H������ǁE�������\'k�8 \b��$�����0�-�{c���l�{���j"�e7؉��ɩ�4]v�/G�8(V^��x��[$0H�QKb�O,I� ��q��.�/ER|!�K]��f~.����щQ`��l$�¬�t3�~W�W��^���2y�ܭ�[Nox~S�/��Q�q��6�#���vMH <#6L�̯WQ�s����}�\n' +
        '�j}��J\t٪8gU�q�:�EM�&\b9��VxL����l�\n' +
        '�ΤCt�P^�cW�m4�.= ����\n' +
        '���W1���|ɨ �dS7���oma�|��bL�����b~���/G�X�f�����/�$ ��\t4 � $���C���`j���sg��Q3���\t�d��<�]���]�H����9�4.�|$�� �(��(�ȅ���q�a5v�-����`p\b��2�x\b�˘{\n' +
        'G���aL_S��[-p�F�>�y��\t*��\\0� ��l�t��O��a[c\f~���I\n' +
        ':3i\\[j��8�\n' +
        '�_�ӻ$Z�l�A���:��O3�]�8=�:��>i�@�:��M>��۟w��`d_\b\'���ieƻ�x\'נ%o;\t��/�Z�Ҧư�N�#���g����ސ΅��{�I��-$6�koj�/j�\\k巺ӸXw"�_ߛu�\n' +
        'p�0\'�&��N�t���I�������n]����I��%5�?6ޣ��]���!�}&}҃����Q���Z�R5�w�G�F��;��^�3e���2M��l���@��,�qN�ʊ�3���Wa����j�@�"X��O���l�h�`,-��W}\b���?��\fd3���rW�(���CO4������n4½�۸ng,�3��L�\b*{��`�鍚i֙��.����r0��Ie�ŕ9)��o#��lB��D�9汜�9�a]���\'�������r���\\�t�|�P�z\t��#o7��d@}ʒ�Һ=�����A ��;\n' +
        '���Q��s��b $�?\t��\n' +
        '\t *y \n' +
        '��"����\t�3;�Xv�1���\\��WoJF؃!�{HJM�\'�LX������t��H��=��JzrT��)�dM�%���Sr D\n' +
        '�Ehq5��{i���yg���\f�\n' +
        '��ҷE�%AĥoRL�����;��!����f��tz*�-��`�����=6NY�i?*?y\'a��^4� ǎB���[�Sc�d��j��d\n' +
        '9P��$���)~3JfM#�� �wT��լ���n���Tq)��Ly��\\�v�:Z�t:AJ�Dؤ�Z��u%�tyEi��վ�`�OZF7YE9[%=���?�M��{��Op��X���5�&E�5��pZ��<����L�<+�s�<������qɆ�u�G-�:r���5���^[��,�ګ s���������8u��H�&��z�~C�YI4�<�Z]��e���V�w޳��i��-��#�qK�j@aq���yv��h��d3*������o!�����S��h� �\n' +
        '��7Ʒ-�yx>,{����qF\\�y�bT�F{���O��� ���tm����cYZS��s�S��\n' +
        'F��s���_��<���8܁�Gz�G������\'(�x�O��\t\n' +
        '���&\n' +
        ';�أD ��ao�j�h樇��O7}0q��ZL�&%ր�5��9�#��t �#���g��/��B��\'ς�B�������BB��́A���fa���\\����w����0g������I���;�����9��bJ_��p�>����D�i=<?��A =����[$�؄]b�|ʕ�@҄fk���f��+��o\n' +
        '�s$]R�*Ew6\\F��D�Q�a\tWb�u\f�H/�ѫ3n�����-�u��!��f��f��b�O�����(ľ�R����9X��%��6�\b�4c���3,9�O���D͎����,5e:�cӍ\n' +
        'e����z�UOΒ�R����\n' +
        '��4T�&�4d�(j��A7��.��<롚$�S���Jf*ގ�D�*�H .p�_+�Ƚ9&p��%��4��ӫ�ڧ�\f>A��G)�t�4Uj~��q�ы�R���>�;��z��Lvb�����uZt:�ċ|T�ܔ9��\b�W���\n' +
        '66Uk�=e�k�� �YsZB}F[�\f�\f���M7P��ꪔi�̽8�����J�\'E����f�}UMf.�Va�����V���\\�\n' +
        '�_ZO�S��dw�}_�u\'f��"U�,�iď��z�ݔ~�i���l̆8�`\n' +
        'Z�#)�ݾ۝gٌ��0�`����$�,�Ϝ$X�m70��������E(Y��8�\f@���@@H�\n' +
        '�_��19�҆5��EL�\'=:�9�%\b�8ZK�������$�����!T��\ta��� �#�� ��`�_.7��|�\\���O����f<$\bG_%� �Q��7�\b�JO��R�PN�T�b`�(.B!N�ZߑÐ`X�&�\\j:����@I�4����\\�d�%"Q��i���HK4޸�*<���î7��\n' +
        't�y���v�w�/�G�\f��f����p�ޞ�~BӋ�p_�\'X_U�8�˴g,�b���\\G$UK�{���&^��ӧq�>d�b-�{Oݝ��mΰ��G\'wo�H�"ZʰƵ�� 1jG� f��eL�̍�����KJ}�Yf��\n' +
        'I�\n' +
        '�3�r�#c�2R0g�F#�<��\tǏ�� ��`6ۗf�����z��&-������1a?���S��8��"�؏ٟ�0&���ӱ�K����̔�(�\t���8����,�g�$�,�0=o���������\f�9��"���@��+ם��`�4�>1+ꢷS�Wi=�����y�����^�Ƨg�ż�TKRd�_ق�,^%\n' +
        '��:��q0��gv��t��_���S����E~��3�y2U�"si뻐�ᓟ��wm����̫�d���g4jj3Z�7������ !��L1W��ݖr���F�T�\n' +
        '��^��\f��{־�\n' +
        '[�\'k\n' +
        '%ԝ8�Ql�Q�Z-m�]�͏�K�����F9�\n' +
        'endstream\n' +
        'endobj\n' +
        '20 0 obj\n' +
        '<</Type/Metadata/Subtype/XML/Length 3084>>\n' +
        'stream\n' +
        '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="3.1-701">\n' +
        '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n' +
        '<rdf:Description rdf:about=""  xmlns:pdf="http://ns.adobe.com/pdf/1.3/">\n' +
        '<pdf:Producer>Microsoft® Word für Office 365</pdf:Producer></rdf:Description>\n' +
        '<rdf:Description rdf:about=""  xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
        '<dc:creator><rdf:Seq><rdf:li>Lars Ripkens</rdf:li></rdf:Seq></dc:creator></rdf:Description>\n' +
        '<rdf:Description rdf:about=""  xmlns:xmp="http://ns.adobe.com/xap/1.0/">\n' +
        '<xmp:CreatorTool>Microsoft® Word für Office 365</xmp:CreatorTool><xmp:CreateDate>2019-12-20T10:14:50+01:00</xmp:CreateDate><xmp:ModifyDate>2019-12-20T10:14:50+01:00</xmp:ModifyDate></rdf:Description>\n' +
        '<rdf:Description rdf:about=""  xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/">\n' +
        '<xmpMM:DocumentID>uuid:D6CAEBBC-718C-428C-9ACF-F62251F290A3</xmpMM:DocumentID><xmpMM:InstanceID>uuid:D6CAEBBC-718C-428C-9ACF-F62251F290A3</xmpMM:InstanceID></rdf:Description>\n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '                                                                                                    \n' +
        '</rdf:RDF></x:xmpmeta><?xpacket end="w"?>\n' +
        'endstream\n' +
        'endobj\n' +
        '21 0 obj\n' +
        '<</DisplayDocTitle true>>\n' +
        'endobj\n' +
        '22 0 obj\n' +
        '<</Type/XRef/Size 22/W[ 1 4 2] /Root 1 0 R/Info 9 0 R/ID[<BCEBCAD68C718C429ACFF62251F290A3><BCEBCAD68C718C429ACFF62251F290A3>] /Filter/FlateDecode/Length 85>>\n' +
        'stream\n' +
        'x�c` ����� �Z��)�7`���b��XZ!�.\b�(����!�b�P�\n' +
        '��\n' +
        '���X;{��\bS)�`� h; Mu\n' +
        ' \n' +
        'endstream\n' +
        'endobj\n' +
        'xref\n' +
        '0 23\n' +
        '0000000010 65535 f\n' +
        '0000000017 00000 n\n' +
        '0000000166 00000 n\n' +
        '0000000222 00000 n\n' +
        '0000000492 00000 n\n' +
        '0000000750 00000 n\n' +
        '0000000918 00000 n\n' +
        '0000001157 00000 n\n' +
        '0000001210 00000 n\n' +
        '0000001263 00000 n\n' +
        '0000000011 65535 f\n' +
        '0000000012 65535 f\n' +
        '0000000013 65535 f\n' +
        '0000000014 65535 f\n' +
        '0000000015 65535 f\n' +
        '0000000016 65535 f\n' +
        '0000000017 65535 f\n' +
        '0000000000 65535 f\n' +
        '0000001924 00000 n\n' +
        '0000002131 00000 n\n' +
        '0000025727 00000 n\n' +
        '0000028894 00000 n\n' +
        '0000028939 00000 n\n' +
        'trailer\n' +
        '<</Size 23/Root 1 0 R/Info 9 0 R/ID[<BCEBCAD68C718C429ACFF62251F290A3><BCEBCAD68C718C429ACFF62251F290A3>] >>\n' +
        'startxref\n' +
        '29223\n' +
        '%%EOF\n' +
        'xref\n' +
        '0 0\n' +
        'trailer\n' +
        '<</Size 23/Root 1 0 R/Info 9 0 R/ID[<BCEBCAD68C718C429ACFF62251F290A3><BCEBCAD68C718C429ACFF62251F290A3>] /Prev 29223/XRefStm 28939>>\n' +
        'startxref\n' +
        '29839\n' +
        '%%EOF';
      if (this.response) {
        this.response
          .status(200)
          .contentType('application/pdf')
          .attachment('testpdf.pdf')
          .send(pdfData);
      }

      // const filestream = fs.createReadStream(Buffer.from(dateiData));
      // filestream.pipe(this.response);

      // this.response.setHeader('Content-Type', datei.inhalt_typ + '; charset=utf-8');

      // this.response.send(dateiData);
      // return this.response;
    }
}
