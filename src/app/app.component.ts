import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostService } from './features/posts/services/post.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-interbank-app';

  private readonly postService = inject(PostService);

  showDataInfo(): void {
    const stats = this.postService.getDataStatistics();

    const message = `
📊 INFORMACIÓN DE DATOS:

✅ Posts personalizados creados: ${stats.customPosts}
🗑️ Posts eliminados: ${stats.deletedPosts}

💾 PERSISTENCIA:
• Los posts que CREES se guardan en localStorage (permanentes)
• Solo puedes EDITAR y ELIMINAR posts que hayas creado
• Los posts de la API son solo de lectura
• Los posts que ELIMINES se ocultan pero los datos originales permanecen

🔄 Para ver solo los datos originales de la API, haz click en "Reset"
    `.trim();

    alert(message);
  }

  clearLocalData(): void {
    if (confirm('¿Estás seguro de que quieres eliminar todos los posts personalizados y mostrar solo los datos originales de la API?')) {
      this.postService.clearAllLocalData();
      alert('✅ Datos limpiados. Refrescando la página...');
      window.location.reload();
    }
  }
}
